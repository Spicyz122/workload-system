// ใส่ URL ของ Google Apps Script Web App ที่ได้จากการ Deploy ในข้อถัดไป
const GOOGLE_SCRIPT_URL = https://script.google.com/macros/s/AKfycbxTVakVqS8gtom7Ba_26VQCxG3l_1XQ5AJ3GxUcx_m2YPY2PVvqiVpE6-Ad8kxtbxC9/exec;

let allWorkloads = [];

// สลับหน้าจอ Tabs
function switchTab(tabName) {
    document.querySelectorAll('[id^="tab-"]').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('text-orange-600', 'bg-orange-50');
        el.classList.add('text-slate-600', 'hover:bg-slate-50', 'hover:text-orange-600');
    });

    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    
    const activeNav = document.getElementById(`nav-${tabName}`);
    activeNav.classList.remove('text-slate-600', 'hover:bg-slate-50', 'hover:text-orange-600');
    activeNav.classList.add('text-orange-600', 'bg-orange-50');

    const titles = {
        'dashboard': 'แดชบอร์ดภาพรวม',
        'workload': 'รายการภาระงานทั้งหมด',
        'calendar': 'ปฏิทินงานรายวัน'
    };
    document.getElementById('page-title').innerText = titles[tabName];
}

// โหลดข้อมูลภาระงาน
async function loadData() {
    const selectedDate = document.getElementById('filter-date').value;
    
    // ข้อมูลจำลอง (Mock Data) หากยังไม่ได้เชื่อมต่อ Google Sheets หรือทดสอบเปิดผ่านเครื่อง
    const mockData = [
        { id: "W001", title: "จัดทำแผนงบประมาณประจำปี", owner: "คุณสมชาย", startDate: "2026-10-01", dueDate: "2026-10-10", status: "กำลังดำเนินการ" },
        { id: "W002", title: "พัฒนาระบบฐานข้อมูลลูกค้า", owner: "คุณวิชัย", startDate: "2026-10-03", dueDate: "2026-10-08", status: "เสร็จสิ้น" },
        { id: "W003", title: "ประชุมสรุปผลงานไตรมาส 3", owner: "คุณกaัญญา", startDate: "2026-10-07", dueDate: "2026-10-09", status: "รอดำเนินการ" },
        { id: "W004", title: "ตรวจสอบความปลอดภัยระบบคลาวด์", owner: "คุณอภิสิทธิ์", startDate: "2026-10-05", dueDate: "2026-10-12", status: "เร่งด่วน" }
    ];

    try {
        if (GOOGLE_SCRIPT_URL !== "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") {
            const response = await fetch(GOOGLE_SCRIPT_URL);
            const result = await response.json();
            allWorkloads = result.data || mockData;
        } else {
            allWorkloads = mockData;
        }
    } catch (error) {
        console.warn("Using mock data due to fetch error:", error);
        allWorkloads = mockData;
    }

    // กรองตามวันที่เลือก (ถ้ามี)
    let filtered = allWorkloads;
    if (selectedDate) {
        filtered = allWorkloads.filter(item => selectedDate >= item.startDate && selectedDate <= item.dueDate);
    }

    renderDashboard(filtered);
    renderFullTable(filtered);
}

function resetFilter() {
    document.getElementById('filter-date').value = '';
    loadData();
}

// เรนเดอร์หน้า Dashboard
function renderDashboard(data) {
    document.getElementById('stat-total').innerText = data.length;
    document.getElementById('stat-inprogress').innerText = data.filter(i => i.status === 'กำลังดำเนินการ').length;
    document.getElementById('stat-completed').innerText = data.filter(i => i.status === 'เสร็จสิ้น').length;
    document.getElementById('stat-urgent').innerText = data.filter(i => i.status === 'เร่งด่วน' || i.status === 'รอดำเนินการ').length;

    const tbody = document.getElementById('dashboard-table-body');
    tbody.innerHTML = data.slice(0, 5).map(item => `
        <tr class="hover:bg-slate-50/80 transition-colors">
            <td class="py-4 font-semibold text-slate-700">${item.title}</td>
            <td class="py-4 text-slate-500">${item.owner}</td>
            <td class="py-4 text-slate-500">${item.dueDate}</td>
            <td class="py-4">${getStatusBadge(item.status)}</td>
        </tr>
    `).join('');
}

// เรนเดอร์ตารางเต็ม
function renderFullTable(data) {
    const tbody = document.getElementById('full-table-body');
    tbody.innerHTML = data.map(item => `
        <tr class="hover:bg-slate-50/80 transition-colors">
            <td class="py-4 font-bold text-orange-600 text-xs">${item.id}</td>
            <td class="py-4 font-semibold text-slate-700">${item.title}</td>
            <td class="py-4 text-slate-500">${item.owner}</td>
            <td class="py-4 text-slate-500">${item.startDate}</td>
            <td class="py-4 text-slate-500">${item.dueDate}</td>
            <td class="py-4">${getStatusBadge(item.status)}</td>
        </tr>
    `).join('');
}

function getStatusBadge(status) {
    const styles = {
        'เสร็จสิ้น': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'กำลังดำเนินการ': 'bg-amber-50 text-amber-600 border-amber-100',
        'เร่งด่วน': 'bg-rose-50 text-rose-600 border-rose-100',
        'รอดำเนินการ': 'bg-slate-100 text-slate-600 border-slate-200'
    };
    const style = styles[status] || 'bg-slate-100 text-slate-600 border-slate-200';
    return `<span class="px-3 py-1 rounded-full text-xs font-semibold border ${style}">${status}</span>`;
}

// โหลดข้อมูลครั้งแรกเมื่อเปิดหน้าเว็บ
window.onload = loadData;