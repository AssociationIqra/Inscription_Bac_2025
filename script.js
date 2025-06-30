const scriptURL = 'https://script.google.com/macros/s/AKfycbxiR7JcBMJC9_A8u6S51Hp1y7niF8lR-lXbcVkJUUcbul5cRcugPXFwDxAsCigdBTL4/exec';

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

// ✅ النسخة المعدلة لدالة postToSheet (تعالج CORS وتعيد JSON)
function postToSheet(payload, action) {
  return fetch(`${scriptURL}?action=${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .catch(err => ({ error: "⚠️ حدث خطأ في الاتصال: " + err.message }));
}

// ✅ لوحة التحكم
if (location.pathname.endsWith('dashboard.html')) {
  const statusMsg = document.getElementById('statusMsg');

  document.getElementById('addStud')?.addEventListener('click', () => {
    postToSheet(gather(), 'add').then(res => {
      statusMsg.innerText = res.message || res.error || "رد غير متوقع.";
    });
  });

  document.getElementById('delStud')?.addEventListener('click', () => {
    let regNo = prompt('أدخل رقم التسجيل للحذف');
    postToSheet({ "رقم التسجيل": regNo }, 'delete').then(res => {
      statusMsg.innerText = res.message || res.error || "رد غير متوقع.";
    });
  });

  document.getElementById('clearForm')?.addEventListener('click', () => {
    formEls.forEach(id => {
      if (document.getElementById(id)) {
        document.getElementById(id).value = '';
      }
    });
    statusMsg.innerText = 'تم التفريغ';
  });

  document.getElementById('getStud')?.addEventListener('click', () => {
    let no = prompt('أدخل رقم التسجيل');
    postToSheet({ "رقم التسجيل": no }, 'get').then(obj => {
      if (obj.error) {
        statusMsg.innerText = obj.error;
      } else {
        fill(obj);
        statusMsg.innerText = 'تم جلب البيانات';
      }
    });
  });

  document.getElementById('editStud')?.addEventListener('click', () => {
    postToSheet(gather(), 'edit').then(res => {
      statusMsg.innerText = res.message || res.error || "رد غير متوقع.";
    });
  });
}
