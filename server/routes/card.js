// server/routes/card.js
const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/cardController");
const Card = require("../models/Card");
const { notifyUsers } = require("../services/notificationService");
const { emitEvent } = require("../services/eventService");
const { logActivity } = require("../services/activityService");


router.post("/", auth, ctrl.create);

router.put("/reorder", auth, async (req, res) => {
  try {
    const { cards, projectId } = req.body; 
    // cards = [{ _id, order, list }]

    if (!Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const actor = req.user._id;
    const notifyMap = new Map(); // cardId -> recipients

    // fetch all affected cards first
    const ids = cards.map(c => c._id);
    const existing = await Card.find({ _id: { $in: ids } })
      .select("assignees watchers list order title project");

    const existingMap = new Map();
    existing.forEach(c => existingMap.set(c._id.toString(), c));

    // =============================
    // BULK UPDATE
    // =============================
    const bulk = cards.map(c => ({
      updateOne: {
        filter: { _id: c._id },
        update: { order: c.order, list: c.list }
      }
    }));

    await Card.bulkWrite(bulk);

    // =============================
    // DETECT CHANGES + COLLECT USERS
    // =============================
    for (const c of cards) {
      const before = existingMap.get(c._id.toString());
      if (!before) continue;

      const movedList = before.list.toString() !== c.list;
      const reordered = before.order !== c.order;

      if (movedList || reordered) {
        const recipients = new Set();

        before.assignees?.forEach(u =>
          recipients.add(u.toString())
        );

        before.watchers?.forEach(u =>
          recipients.add(u.toString())
        );

        notifyMap.set(c._id.toString(), {
          recipients: [...recipients],
          title: before.title,
          list: c.list
        });

        // Log activity for EACH move/reorder if needed, or once for the bulk
        await logActivity({
          project: before.project || projectId,
          actor: req.user._id,
          type: "card_moved",
          refModel: "Card",
          refId: c._id,
          meta: {
            from: before.list,
            to: c.list,
            title: before.title
          }
        });
      }
    }

    // =============================
    // SEND NOTIFICATIONS
    // =============================
    for (const [cardId, data] of notifyMap.entries()) {
      if (!data.recipients.length) continue;

      await notifyUsers(data.recipients, {
        type: "card_moved",
        actor,
        refModel: "Card",
        refId: cardId,
        meta: {
          title: data.title,
          list: data.list
        }
      });
    }

    res.json({ success: true });

  } catch (err) {
    console.error("Reorder error:", err);
    res.status(500).json({ message: "Reorder failed" });
  }
});

router.get("/list/:listId", auth, ctrl.byList);
router.get("/project/:projectId", auth, ctrl.byProject);
router.get("/:id", auth, ctrl.getOne);
router.get("/:id/activity", auth, ctrl.getActivity);
router.put("/:id", auth, ctrl.update);
router.delete("/:id", auth, ctrl.remove);


module.exports = router;
