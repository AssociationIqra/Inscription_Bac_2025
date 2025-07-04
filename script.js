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

// ✅ تجنب CORS باستخدام x-www-form-urlencoded
function postToSheet(payload, action) {
  const formData = new URLSearchParams();
  formData.append("action", action);
  formData.append("data", JSON.stringify(payload));

  return fetch(scriptURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData.toString()
  })
  .then(res => res.json())
  .catch(err => ({ error: "⚠️ حدث خطأ في الاتصال: " + err.message }));
}

// ✅ لوحة التحكم
if (location.pathname.endsWith('dashboard.html')) {
  const statusMsg = document.getElementById('statusMsg');

  function showMsg(txt, time = 3000) {
    statusMsg.innerText = txt;
    statusMsg.style.opacity = 1;
    setTimeout(() => {
      statusMsg.style.opacity = 0;
    }, time);
  }

  document.getElementById('addStud')?.addEventListener('click', () => {
    postToSheet(gather(), 'add').then(res => {
      showMsg(res.message || res.error || "رد غير متوقع.");
    });
  });

  document.getElementById('delStud')?.addEventListener('click', () => {
    let regNo = prompt('أدخل رقم التسجيل للحذف');
    if (!regNo) return;
    postToSheet({ "رقم التسجيل": regNo }, 'delete').then(res => {
      showMsg(res.message || res.error || "رد غير متوقع.");
    });
  });

  document.getElementById('clearForm')?.addEventListener('click', () => {
    formEls.forEach(id => {
      if (document.getElementById(id)) {
        document.getElementById(id).value = '';
      }
    });
    showMsg('🧹 تم تفريغ البيانات');
  });

  document.getElementById('getStud')?.addEventListener('click', () => {
    let no = prompt('أدخل رقم التسجيل');
    if (!no) return;
    postToSheet({ "رقم التسجيل": no }, 'get').then(obj => {
      if (obj.error) {
        showMsg(obj.error);
      } else {
        fill(obj);
        showMsg('📥 تم جلب البيانات');
      }
    });
  });

  document.getElementById('editStud')?.addEventListener('click', () => {
    postToSheet(gather(), 'edit').then(res => {
      showMsg(res.message || res.error || "رد غير متوقع.");
    });
  });
}
