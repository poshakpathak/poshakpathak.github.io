import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import matter from 'gray-matter';

const postsDir = './posts';
const templatePath = path.join(postsDir, 'template.html');
const template = fs.readFileSync(templatePath, 'utf8');

const indexItems = [];

// Use new marked.Renderer() for custom heading rendering
const renderer = new marked.Renderer();



// Process all .md files in /posts
for (const file of fs.readdirSync(postsDir)) {
  if (!file.endsWith('.md')) continue;

  const mdPath = path.join(postsDir, file);
  const raw = fs.readFileSync(mdPath, 'utf8');
  const { data, content } = matter(raw);

  const slug = data.slug || path.basename(file, '.md');
  const outputPath = path.join(postsDir, `${slug}.html`);

  // Use the custom renderer directly in the marked call
  const htmlContent = marked(content, { renderer });

  const finalHTML = template
    .replace(/{{\s*title\s*}}/g, data.title)
    .replace(/{{\s*date\s*}}/g, data.date)
    .replace(/{{\s*dateReadable\s*}}/g, data.dateReadable || new Date(data.date).toDateString())
    .replace(/{{\s*tag\s*}}/g, data.tag)
    .replace(/{{\s*image\s*}}/g, data.image)
    .replace(/{{\s*caption\s*}}/g, data.caption || '')
    .replace(/{{\s*fullUrl\s*}}/g, `posts/${slug}.html`)
    .replace(/{{\s*content\s*}}/g, htmlContent);

  fs.writeFileSync(outputPath, finalHTML);
  console.log(`✅ Created: ${outputPath}`);

  indexItems.push({ ...data, slug });
}

// ✅ Optional dashboard
const devCards = indexItems.map(post => `
  <tr class="border-b border-gray-700">
    <td class="py-2 px-4 font-medium text-white">${post.title}</td>
    <td class="py-2 px-4 text-gray-400">${post.date}</td>
    <td class="py-2 px-4 text-yellow-300">${post.tag}</td>
    <td class="py-2 px-4">
      <a href="posts/${post.slug}.html" class="text-blue-400 underline" target="_blank">Preview</a>
    </td>
  </tr>
`).join('\n');

const dashboardHTML = `
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <title>Blog Dev Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config = { darkMode: 'class' }</script>
</head>
<body class="bg-[#121212] text-white font-sans px-8 py-10">
  <h1 class="text-3xl font-bold mb-6">🛠️ Blog Dev Dashboard</h1>
  <table class="w-full border-collapse text-sm">
    <thead>
      <tr class="text-left border-b border-gray-600">
        <th class="py-2 px-4">Title</th>
        <th class="py-2 px-4">Date</th>
        <th class="py-2 px-4">Tag</th>
        <th class="py-2 px-4">Link</th>
      </tr>
    </thead>
    <tbody>
      ${devCards}
    </tbody>
  </table>
  <p class="mt-8 text-xs text-gray-500">Open this file locally at <code>dashboard.html</code></p>
</body>
</html>
`;

fs.writeFileSync('dashboard.html', dashboardHTML);
console.log('✅ dashboard.html generated');
