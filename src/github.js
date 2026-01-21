const REPO_OWNER = 'OutFoxD';
const REPO_NAME = 'Project-Portfolio';
const API_BASE = 'https://api.github.com';

export async function uploadImage(token, imageBase64, filename) {
  const path = `docs/${filename}`;
  const url = `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Add image: ${filename}`,
      content: imageBase64,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload image');
  }

  return await response.json();
}

export async function updateHtml(token, imageFilename, text, date) {
  const path = 'now/index.html';
  const url = `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

  // Fetch current HTML file
  const getResponse = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!getResponse.ok) {
    throw new Error('Failed to fetch index.html');
  }

  const fileData = await getResponse.json();
  const currentContent = atob(fileData.content.replace(/\n/g, ''));

  // Create new entry HTML (matching the existing format)
  const newEntry = `<div class="date">Update: ${date}</div>
<img src="../docs/${imageFilename}" style="max-width:100%;border-radius:8px;margin:4px 0 8px 0">
<ul>
  <li>${escapeHtml(text)}</li>
</ul>

`;

  // Insert before the first "Update:" entry (after the workbench link)
  const updatedContent = currentContent.replace(
    /(<div class="date">Update:)/i,
    `${newEntry}$1`
  );

  // Commit updated HTML
  const putResponse = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `New post: ${date}`,
      content: btoa(updatedContent),
      sha: fileData.sha,
    }),
  });

  if (!putResponse.ok) {
    const error = await putResponse.json();
    throw new Error(error.message || 'Failed to update index.html');
  }

  return await putResponse.json();
}

export async function verifyToken(token) {
  const url = `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  return response.ok;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
