// services/fileUpload.js
export async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: form
  });

  return res.json();
}
