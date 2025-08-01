function initFeed() {

  fetch('components/create-post.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('create-post-container').innerHTML = html;
    const script = document.createElement('script');
    script.src = 'scripts/createPost.js';
    document.body.appendChild(script);
  });
  
}
