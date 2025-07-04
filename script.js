const scriptURL = 'https://script.google.com/macros/s/AKfycbzqeuzeKTdwnJd2f6O__SrrnOuEGCLwsR-zUKnhXVYQKzxn1xd4kpU-MhxN3fAc5-S3lw/exec';

// 🧠 تحميل المستخدمين من localStorage
let users = JSON.parse(localStorage.getItem('users') || '[]');

// ✅ تسجيل مستخدم جديد
document.getElementById('btnRegister')?.addEventListener('click', () => {
  let username = document.getElementById('regUsername')?.value.trim();
  let pass = document.getElementById('regPass')?.value.trim();
  const msg = document.getElementById('regMsg');

  if (!username || !pass) {
    if (msg) msg.innerText = 'يرجى إدخال اسم المستخدم وكلمة المرور.';
    return;
  }

  if (users.find(u => u.username === username)) {
    if (msg) msg.innerText = '⚠️ اسم المستخدم موجود مسبقًا.';
    return;
  }

  users.push({ username, password: pass });
  localStorage.setItem('users', JSON.stringify(users));
  if (msg) msg.innerText = '✅ تم التسجيل! يمكنك تسجيل الدخول الآن.';
});

// ✅ تسجيل الدخول
document.getElementById('btnLogin')?.addEventListener('click', () => {
  let username = document.getElementById('loginUser')?.value.trim();
  let pass = document.getElementById('loginPass')?.value.trim();
  const msg = document.getElementById('loginMsg');

  const match = users.find(u => u.username === username && u.password === pass);

  if (match) {
    localStorage.setItem('loggedIn', 'true');
    location.href = 'dashboard.html';
  } else {
    if (msg) msg.innerText = '❌ اسم المستخدم أو كلمة المرور غير صحيحة.';
  }
});

// ✅ منع الوصول للوحة التحكم مباشرة
if (location.pathname.endsWith('dashboard.html')) {
  if (!localStorage.getItem('loggedIn')) location.href = 'index.html';
}

// ✅ ترجمة الحقول
const fieldMap = {
  fname: "الاسم",
  lname: "اللقب",
  dob: "تاريخ الميلاد",
  regNo: "رقم التسجيل",
  regPassStud: "الرقم السري",
  stream: "الشعبة",
  phase1: "مرحلة التسجيل الأولي",
  phase2: "مرحلة تأكيد التسجيل",
  pedDate: "تاريخ التسجيل البيداغوجي",
  socDate: "تاريخ تسجيل الخدمات الجامعية",
  wish: "الرغبة",
  major: "التخصص",
  state: "الولاية",
  payNotes: "حالة الدفع",
  grade: "المعدل"
};

const formEls = Object.keys(fieldMap);

function gather() {
  let o = {};
  formEls.forEach(id => {
    const arabicKey = fieldMap[id];
    o[arabicKey] = document.getElementById(id)?.value || '';
  });
  return o;
}

function fill(obj) {
  for (const [engKey, arabicKey] of Object.entries(fieldMap)) {
    if (document.getElementById(engKey)) {
      document.getElementById(engKey).value = obj[arabicKey] || "";
    }
  }
}

// ✅ حل CORS باستخدام JSONP للقراءة و Proxy للكتابة
async function postToSheet(payload, action) {
  try {
    // حل بديل باستخدام Proxy إذا استمرت مشكلة CORS
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const response = await fetch(proxyUrl + scriptURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: `action=${action}&data=${encodeURIComponent(JSON.stringify(payload))}`
    });
    
    if (!response.ok) throw new Error('Network response was not ok');
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
    return { error: "⚠️ حدث خطأ في الاتصال: " + error.message };
  }
}

// ✅ لوحة التحكم
if (location.pathname.endsWith('dashboard.html')) {
  const statusMsg = document.getElementById('statusMsg');

  function showMsg(txt, time = 3000) {
    if (!statusMsg) return;
    statusMsg.innerText = txt;
    statusMsg.style.opacity = 1;
    setTimeout(() => {
      statusMsg.style.opacity = 0;
    }, time);
  }

  document.getElementById('addStud')?.addEventListener('click', async () => {
    const res = await postToSheet(gather(), 'add');
    showMsg(res.message || res.error || "رد غير متوقع.");
  });

  document.getElementById('delStud')?.addEventListener('click', async () => {
    let regNo = prompt('أدخل رقم التسجيل للحذف');
    if (!regNo) return;
    const res = await postToSheet({ "رقم التسجيل": regNo }, 'delete');
    showMsg(res.message || res.error || "رد غير متوقع.");
  });

  document.getElementById('clearForm')?.addEventListener('click', () => {
    formEls.forEach(id => {
      if (document.getElementById(id)) {
        document.getElementById(id).value = '';
      }
    });
    showMsg('🧹 تم تفريغ البيانات');
  });

  document.getElementById('getStud')?.addEventListener('click', async () => {
    let no = prompt('أدخل رقم التسجيل');
    if (!no) return;
    const obj = await postToSheet({ "رقم التسجيل": no }, 'get');
    if (obj.error) {
      showMsg(obj.error);
    } else {
      fill(obj);
      showMsg('📥 تم جلب البيانات');
    }
  });

  document.getElementById('editStud')?.addEventListener('click', async () => {
    const res = await postToSheet(gather(), 'edit');
    showMsg(res.message || res.error || "رد غير متوقع.");
  });
}
