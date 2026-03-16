import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  MessageSquare,
  Megaphone,
  Plus,
  Send,
} from "lucide-react";
import { useProject } from "../../context/ProjectContext";
import { socialMediaApi } from "../../api/socialMediaApi";
import SocialPostEditor from "./SocialPostEditor";
import SocialHeaderStats from "./components/SocialHeaderStats";
import FutureLabPanel from "./components/FutureLabPanel";
import "./SocialMediaManager.css";

const PLATFORMS = ["facebook", "instagram", "x", "linkedin", "youtube", "tiktok"];
const TASK_COLUMNS = ["todo", "in_progress", "review", "done"];

export default function SocialMediaManager() {
  const { projectId } = useProject();
  const { channelId } = useParams();

  const [tab, setTab] = useState("tasks");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [posts, setPosts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [discussions, setDiscussions] = useState([]);

  const [newPost, setNewPost] = useState({
    title: "",
    caption: "",
    contentHtml: "",
    contentType: "text",
    platforms: ["instagram"],
    scheduledAt: "",
  });
  const [postMedia, setPostMedia] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", status: "todo" });
  const [message, setMessage] = useState("");
  const [selectedPostId, setSelectedPostId] = useState("");
  const [noteText, setNoteText] = useState("");

  const loadOverview = async () => {
    if (!projectId) return;

    setLoading(true);
    setError("");

    try {
      const data = await socialMediaApi.overview(projectId, channelId);
      setPosts(Array.isArray(data?.posts) ? data.posts : []);
      setTasks(Array.isArray(data?.tasks) ? data.tasks : []);
      setDiscussions(Array.isArray(data?.discussions) ? data.discussions : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load social media manager data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, [projectId, channelId]);

  const tasksByStatus = useMemo(() => {
    const grouped = { todo: [], in_progress: [], review: [], done: [] };
    for (const t of tasks) {
      if (grouped[t.status]) grouped[t.status].push(t);
    }
    return grouped;
  }, [tasks]);

  const scheduledPosts = useMemo(
    () => posts.filter((p) => p.scheduledAt).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)),
    [posts]
  );

  const selectedPost = useMemo(
    () => posts.find((p) => String(p._id) === String(selectedPostId)) || null,
    [posts, selectedPostId]
  );

  const stats = useMemo(() => {
    const openTasks = tasks.filter((t) => t.status !== "done").length;
    const scheduledPostsCount = posts.filter((p) => p.status === "scheduled").length;
    const publishedPosts = posts.filter((p) => p.status === "published").length;

    return {
      openTasks,
      scheduledPosts: scheduledPostsCount,
      publishedPosts,
      discussions: discussions.length,
    };
  }, [tasks, posts, discussions]);


  const runWithRollback = async ({
    applyOptimistic,
    rollback,
    mutation,
    onSuccess,
    errorMessage,
  }) => {
    applyOptimistic?.();
    try {
      const result = await mutation();
      onSuccess?.(result);
    } catch (err) {
      console.error(err);
      rollback?.();
      setError(errorMessage || "Action failed.");
    }
  };

  const createPost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim()) return;

    const created = await socialMediaApi.createPost(projectId, {
      ...newPost,
      channel: channelId || null,
      scheduledAt: newPost.scheduledAt || null,
      media: postMedia,
    });

    setPosts((prev) => [created, ...prev]);
    setNewPost({
      title: "",
      caption: "",
      contentHtml: "",
      contentType: "text",
      platforms: ["instagram"],
      scheduledAt: "",
    });
    setPostMedia([]);
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const created = await socialMediaApi.createTask(projectId, {
      ...newTask,
      channel: channelId || null,
      socialPost: selectedPostId || null,
    });

    setTasks((prev) => [created, ...prev]);
    setNewTask({ title: "", description: "", status: "todo" });
  };

  const moveTask = async (task, status) => {
    const previousTasks = tasks;

    await runWithRollback({
      applyOptimistic: () => {
        setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status } : t)));
      },
      rollback: () => setTasks(previousTasks),
      mutation: () => socialMediaApi.updateTask(task._id, { status }),
      onSuccess: (updated) => {
        setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));
      },
      errorMessage: "Could not move task. Changes were rolled back.",
    });
  };

  const createDiscussion = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const created = await socialMediaApi.createDiscussion(projectId, {
      channel: channelId || null,
      socialPost: selectedPostId || null,
      message,
      kind: "discussion",
    });

    setDiscussions((prev) => [created, ...prev]);
    setMessage("");
  };

  const addPostNote = async (e) => {
    e.preventDefault();
    if (!selectedPostId || !noteText.trim()) return;

    const updatedPost = await socialMediaApi.addPostNote(selectedPostId, {
      text: noteText,
      nodeId: null,
      important: true,
    });

    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
    setNoteText("");
  };

  const publishNow = async (post) => {
    const previousPosts = posts;

    await runWithRollback({
      applyOptimistic: () => {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === post._id ? { ...p, status: "published", publishedAt: new Date().toISOString() } : p
          )
        );
      },
      rollback: () => setPosts(previousPosts),
      mutation: () => socialMediaApi.publishPost(post._id),
      onSuccess: (updated) => {
        setPosts((prev) => prev.map((p) => (p._id === post._id ? updated : p)));
      },
      errorMessage: "Could not publish this post. Changes were rolled back.",
    });
  };

  const schedule = async (post, dateValue) => {
    const previousPosts = posts;

    await runWithRollback({
      applyOptimistic: () => {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === post._id
              ? { ...p, status: dateValue ? "scheduled" : p.status, scheduledAt: dateValue || null }
              : p
          )
        );
      },
      rollback: () => setPosts(previousPosts),
      mutation: () => socialMediaApi.schedulePost(post._id, dateValue),
      onSuccess: (updated) => {
        setPosts((prev) => prev.map((p) => (p._id === post._id ? updated : p)));
      },
      errorMessage: "Could not schedule this post. Changes were rolled back.",
    });
  };

  return (
    <div className="social-manager-container">
      <aside className="sm-sidebar">
        <div className="brand">
          <Megaphone size={18} />
          <div>
            <h2>Social Media Hub</h2>
            <p>Plan • Discuss • Publish</p>
          </div>
        </div>

        <nav>
          <button className={tab === "tasks" ? "active" : ""} onClick={() => setTab("tasks")}>Task Manager</button>
          <button className={tab === "calendar" ? "active" : ""} onClick={() => setTab("calendar")}>Content Calendar</button>
          <button className={tab === "posts" ? "active" : ""} onClick={() => setTab("posts")}>Post Studio</button>
          <button className={tab === "discussion" ? "active" : ""} onClick={() => setTab("discussion")}>Group Discussion</button>
        </nav>

        <div className="platforms">
          <h4>Platforms</h4>
          <div className="chips">{PLATFORMS.map((p) => <span key={p}>{p}</span>)}</div>
        </div>
      </aside>

      <main className="sm-main">
        <header className="sm-header">
          <div>
            <h1>Social Media Management</h1>
            <p>Coordinate tasks, discussion, notes, and publishing across your creator team.</p>
          </div>
          <button className="refresh-btn" onClick={loadOverview}>Refresh</button>
        </header>

        {loading && <div className="state">Loading workspace…</div>}
        {error && <div className="error">{error}</div>}

        {!loading && (
          <div className="sm-content">
            <SocialHeaderStats stats={stats} />

            {tab === "tasks" && (
              <section className="task-manager-grid">
                <form className="sm-card" onSubmit={createTask}>
                  <h3>Create Team Task</h3>
                  <input
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask((s) => ({ ...s, title: e.target.value }))}
                  />
                  <textarea
                    placeholder="Task description"
                    value={newTask.description}
                    onChange={(e) => setNewTask((s) => ({ ...s, description: e.target.value }))}
                  />
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask((s) => ({ ...s, status: e.target.value }))}
                  >
                    {TASK_COLUMNS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button type="submit"><Plus size={14} /> Add Task</button>
                </form>

                <div className="kanban-columns">
                  {TASK_COLUMNS.map((status) => (
                    <div key={status} className="kanban-col">
                      <h4>{status.replace("_", " ")}</h4>
                      {(tasksByStatus[status] || []).map((task) => (
                        <article key={task._id} className="task-card">
                          <strong>{task.title}</strong>
                          <p>{task.description}</p>
                          <div className="task-actions">
                            {TASK_COLUMNS.filter((s) => s !== task.status).slice(0, 2).map((next) => (
                              <button key={next} onClick={() => moveTask(task, next)}>{next}</button>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tab === "calendar" && (
              <section className="sm-card">
                <h3><CalendarIcon size={16} /> Content Calendar</h3>
                {scheduledPosts.length === 0 ? (
                  <p className="empty">No scheduled posts yet.</p>
                ) : (
                  <div className="calendar-list">
                    {scheduledPosts.map((p) => (
                      <div className="calendar-item" key={p._id}>
                        <div>
                          <strong>{p.title}</strong>
                          <p>{new Date(p.scheduledAt).toLocaleString()}</p>
                        </div>
                        <div className="platform-badges">
                          {(p.platforms || []).map((pl) => <span key={pl}>{pl}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {tab === "posts" && (
              <section className="posts-layout">
                <form className="sm-card" onSubmit={createPost}>
                  <h3>Post Studio</h3>
                  <input
                    placeholder="Post title"
                    value={newPost.title}
                    onChange={(e) => setNewPost((s) => ({ ...s, title: e.target.value }))}
                  />
                  <textarea
                    placeholder="Short caption"
                    value={newPost.caption}
                    onChange={(e) => setNewPost((s) => ({ ...s, caption: e.target.value }))}
                  />
                  <SocialPostEditor
                    value={newPost.contentHtml}
                    onChange={(html) => setNewPost((s) => ({ ...s, contentHtml: html }))}
                    media={postMedia}
                    setMedia={setPostMedia}
                  />
                  <select
                    value={newPost.contentType}
                    onChange={(e) => setNewPost((s) => ({ ...s, contentType: e.target.value }))}
                  >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="carousel">Carousel</option>
                    <option value="blog">Blog</option>
                  </select>
                  <input
                    type="datetime-local"
                    value={newPost.scheduledAt}
                    onChange={(e) => setNewPost((s) => ({ ...s, scheduledAt: e.target.value }))}
                  />
                  <div className="chips select-chips">
                    {PLATFORMS.map((p) => (
                      <button
                        type="button"
                        key={p}
                        className={newPost.platforms.includes(p) ? "active" : ""}
                        onClick={() =>
                          setNewPost((s) => ({
                            ...s,
                            platforms: s.platforms.includes(p)
                              ? s.platforms.filter((x) => x !== p)
                              : [...s.platforms, p],
                          }))
                        }
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button type="submit"><Plus size={14} /> Create Post</button>
                </form>

                <div className="sm-card post-list">
                  <h3>Content Pipeline</h3>
                  {posts.length === 0 ? (
                    <p className="empty">No posts yet.</p>
                  ) : (
                    posts.map((p) => (
                      <article
                        key={p._id}
                        className={`post-card ${selectedPostId === p._id ? "active" : ""}`}
                        onClick={() => setSelectedPostId(p._id)}
                      >
                        <div className="row">
                          <strong>{p.title}</strong>
                          <span className={`status ${p.status}`}>{p.status}</span>
                        </div>
                        <p>{p.caption || "No caption"}</p>
                        {!!p.contentHtml && <small className="content-rich-label">Rich content</small>}
                        <div className="row">
                          <div className="platform-badges">
                            {(p.platforms || []).map((pl) => <span key={pl}>{pl}</span>)}
                            {p.media?.length ? <span>{p.media.length} media</span> : null}
                          </div>
                          <div className="actions">
                            <button onClick={(e) => { e.stopPropagation(); publishNow(p); }}>
                              <CheckCircle2 size={13} /> Publish
                            </button>
                            <input
                              type="datetime-local"
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => schedule(p, e.target.value)}
                            />
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>

                <form className="sm-card" onSubmit={addPostNote}>
                  <h3>Canvas Notes / Context</h3>
                  <select value={selectedPostId} onChange={(e) => setSelectedPostId(e.target.value)}>
                    <option value="">Select post</option>
                    {posts.map((p) => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Important context for image/video content, CTA, brand voice, references..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                  />
                  <button type="submit">Add Important Note</button>

                  {selectedPost?.notes?.length ? (
                    <div className="note-list">
                      {selectedPost.notes.slice(0, 8).map((n) => (
                        <div key={n._id} className="note-item">
                          <p>{n.text}</p>
                          <small>{n.author?.name || "Member"}</small>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </form>
              </section>
            )}

            {tab === "discussion" && (
              <section className="discussion-layout">
                <form className="sm-card" onSubmit={createDiscussion}>
                  <h3><MessageSquare size={16} /> Group Discussion</h3>
                  <select value={selectedPostId} onChange={(e) => setSelectedPostId(e.target.value)}>
                    <option value="">General thread</option>
                    {posts.map((p) => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Discuss copy ideas, hooks, target audience, publishing strategy..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button type="submit"><Send size={14} /> Send</button>
                </form>

                <div className="sm-card discussion-stream">
                  <h3>Team Chat Stream</h3>
                  {discussions.length === 0 ? (
                    <p className="empty">No discussion yet. Start the planning thread.</p>
                  ) : (
                    discussions.map((d) => (
                      <article key={d._id} className="discussion-item">
                        <div className="row">
                          <strong>{d.author?.name || "Team member"}</strong>
                          <span>{new Date(d.createdAt).toLocaleString()}</span>
                        </div>
                        <p>{d.message}</p>
                        {d.socialPost?.title && <small>Post: {d.socialPost.title}</small>}
                      </article>
                    ))
                  )}
                </div>
              </section>
            )}

            <FutureLabPanel />
          </div>
        )}
      </main>
    </div>
  );
}
