const scriptURL = 'https://script.google.com/macros/s/AKfycbwZnbAbC4wv-nTgT1zGLPjvbtF0POh2lKMok1gCARvPFQFTwzu98Fmyc2_webV95Hsxhg/exec';

// 🧠 تحميل المستخدمين من localStorage
let users = JSON.parse(localStorage.getItem('users') || '[]');

// ✅ تسجيل مستخدم جديد (باستخدام اسم المستخدم)
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

// ✅ تسجيل الدخول (باستخدام اسم المستخدم)
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

// ✅ منع الوصول المباشر للوحة التحكم دون تسجيل دخول
if (location.pathname.endsWith('dashboard.html')) {
  if (!localStorage.getItem('loggedIn')) location.href = 'index.html';
}

// ✅ ربط الحقول بالترجمة العربية (مطلوب لـ Google Sheet)
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

function postToSheet(payload, action) {
  return fetch(`${scriptURL}?action=${action}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }).then(r => r.text());
}

// ✅ أوامر لوحة التحكم (dashboard.html)
if (location.pathname.endsWith('dashboard.html')) {
  const statusMsg = document.getElementById('statusMsg');

  document.getElementById('addStud')?.addEventListener('click', () => {
    postToSheet(gather(), 'add').then(txt => statusMsg.innerText = txt);
  });

  document.getElementById('delStud')?.addEventListener('click', () => {
    let regNo = prompt('أدخل رقم التسجيل للحذف');
    postToSheet({ "رقم التسجيل": regNo }, 'delete').then(txt => statusMsg.innerText = txt);
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
    postToSheet({ "رقم التسجيل": no }, 'get').then(txt => {
      try {
        let obj = JSON.parse(txt);
        if (obj.error) {
          statusMsg.innerText = obj.error;
        } else {
          fill(obj);
          statusMsg.innerText = 'تم جلب البيانات';
        }
      } catch (e) {
        statusMsg.innerText = "⚠️ خطأ في البيانات المستلمة: " + txt;
      }
    });
  });

  document.getElementById('editStud')?.addEventListener('click', () => {
    postToSheet(gather(), 'edit').then(txt => statusMsg.innerText = txt);
  });
}


