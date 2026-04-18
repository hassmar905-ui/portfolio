// ── Global ────────────────────────────────────────────

function showPage(id) {
  document.querySelectorAll('.page-section').forEach(function(s) { s.classList.remove('active'); });
  var t = document.getElementById(id);
  if (t) t.classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    a.classList.toggle('active', a.getAttribute('href') === '#' + id);
  });
  window.scrollTo(0, 0);
}

function openProject(url, title) {
  document.getElementById('projectFrame').src = url;
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('projectModal').style.display = 'flex';
}
function closeProject() {
  document.getElementById('projectModal').style.display = 'none';
  document.getElementById('projectFrame').src = '';
}

function unlockAdmin() {
  var f = document.getElementById('adminForm');
  f.classList.toggle('visible');
}
function checkPass() {
  if (document.getElementById('adminPass').value === 'hass3133') {
    document.getElementById('adminForm').classList.remove('visible');
    document.getElementById('uploadSection').classList.add('visible');
    document.getElementById('adminBtn').style.display = 'none';
  } else {
    alert('Wrong password!');
    document.getElementById('adminPass').value = '';
  }
}

function saveProjects() {
  var arr = [];
  document.querySelectorAll('.project-card[data-saved]').forEach(function(c) {
    arr.push({ title:c.getAttribute('data-title'), desc:c.getAttribute('data-desc'),
               tags:c.getAttribute('data-tags'), link:c.getAttribute('data-link'),
               img:c.getAttribute('data-img'), video:c.getAttribute('data-video') });
  });
  try { localStorage.setItem('hassen_projects', JSON.stringify(arr)); } catch(e) {}
}

function buildCard(title, desc, tags, link, src, isVideo) {
  var c = document.createElement('div');
  c.className = 'project-card';
  c.setAttribute('data-saved','1');
  c.setAttribute('data-title', title);
  c.setAttribute('data-desc',  desc);
  c.setAttribute('data-tags',  tags||'');
  c.setAttribute('data-link',  link||'');
  c.setAttribute('data-img',   src||'');
  c.setAttribute('data-video', isVideo?'1':'');
  var imgHTML = src
    ? (isVideo
        ? '<div class="project-img-wrap"><video src="'+src+'" style="width:100%;height:160px;object-fit:cover;border-radius:8px;" controls muted></video></div>'
        : '<div class="project-img-wrap"><img src="'+src+'" style="width:100%;height:160px;object-fit:cover;border-radius:8px;"></div>')
    : '<div class="project-img-wrap"><div class="project-icon"><i class="fas fa-folder-open"></i></div></div>';
  var tagsHTML = tags ? tags.split(',').map(function(t){return '<span>'+t.trim()+'</span>';}).join('') : '';
  var linkHTML = link
    ? '<div class="project-actions"><button onclick="openProject(\''+link+'\',\''+title+'\')" class="project-link"><i class="fas fa-external-link-alt"></i> View Live Demo</button></div>'
    : '';
  c.innerHTML = imgHTML+'<div class="project-body"><h3>'+title+'</h3><p>'+desc+'</p><div class="project-tags">'+tagsHTML+'</div>'+linkHTML+'<button class="remove-btn"><i class="fas fa-trash"></i> Remove</button></div>';
  c.querySelector('.remove-btn').addEventListener('click', function() {
    c.style.transition='opacity 0.3s'; c.style.opacity='0';
    setTimeout(function(){ c.remove(); saveProjects(); }, 300);
  });
  document.getElementById('projectsGrid').prepend(c);
}

function submitProject() {
  var title = document.getElementById('projTitle').value.trim();
  var desc  = document.getElementById('projDesc').value.trim();
  var tags  = document.getElementById('projTags').value.trim();
  var link  = document.getElementById('projLink').value.trim();
  var file  = document.getElementById('projImage').files[0];
  if (!title) { alert('Please enter a title.'); return; }
  if (!desc)  { alert('Please enter a description.'); return; }
  if (file) {
    var isVideo = file.type.startsWith('video/');
    var r = new FileReader();
    r.onload = function(ev){ buildCard(title,desc,tags,link,ev.target.result,isVideo); saveProjects(); };
    r.readAsDataURL(file);
  } else {
    buildCard(title,desc,tags,link,null,false);
    saveProjects();
  }
  ['projTitle','projDesc','projTags','projLink'].forEach(function(id){ document.getElementById(id).value=''; });
  document.getElementById('projImage').value='';
}

// ── DOM Ready ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {

  showPage('home');

  // load saved projects
  try {
    JSON.parse(localStorage.getItem('hassen_projects')||'[]').forEach(function(p){
      buildCard(p.title,p.desc,p.tags,p.link,p.img,p.video==='1');
    });
  } catch(e){}

  // nav links
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var id = this.getAttribute('href').slice(1);
      var sec = document.getElementById(id);
      if (sec && sec.classList.contains('page-section')) {
        e.preventDefault();
        showPage(id);
        document.getElementById('navLinks').classList.remove('open');
        document.getElementById('hamburger').innerHTML = '<i class="fas fa-bars"></i>';
      }
    });
  });

  // hamburger
  document.getElementById('hamburger').addEventListener('click', function() {
    var nl = document.getElementById('navLinks');
    nl.classList.toggle('open');
    this.innerHTML = nl.classList.contains('open') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  });

  // theme
  var light = false;
  document.getElementById('themeToggle').addEventListener('click', function() {
    light = !light;
    document.body.classList.toggle('light-theme', light);
    this.innerHTML = light ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  });

  // ESC closes modal
  document.addEventListener('keydown', function(e) { if(e.key==='Escape') closeProject(); });

  // typed animation
  var words = ['Full-Stack Developer','Web Designer','Mobile App Developer','Problem Solver'];
  var wi=0, ci=0, del=false;
  function type() {
    var el = document.getElementById('typed');
    if (!el) return;
    var w = words[wi];
    el.textContent = del ? w.slice(0,ci--) : w.slice(0,ci++);
    if (!del && ci > w.length) { del=true; setTimeout(type,1800); return; }
    if (del && ci < 0) { del=false; wi=(wi+1)%words.length; ci=0; }
    setTimeout(type, del?50:100);
  }
  type();

  // contact form
  var cf = document.getElementById('contactForm');
  if (cf) {
    cf.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = document.getElementById('sendBtn');
      btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
      btn.style.background = '#22c55e';
      setTimeout(function(){
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        btn.style.background = '';
        cf.reset();
      }, 3000);
    });
  }

});
