# 🚀 COMMISSION SYSTEM - QUICK START GUIDE

## 🎯 FOR ADMINS

### **Setup (First Time)**
1. Go to `/admin/commission`
2. Set commission rate (default: 10%)
3. Set delivery fee (default: ₹30)
4. Choose mode: Flat or Tier-based
5. Click "Save Changes"

### **Generate Payouts (Every Monday)**
1. Go to `/admin/payouts`
2. Click "🔄 Generate Payouts"
3. Review generated payouts
4. Approve each payout
5. Process payments
6. Mark as paid with transaction ID

### **View Analytics**
1. Go to `/admin/analytics`
2. Select period (day/week/month/year)
3. View commission earned
4. Check top sellers
5. Analyze trends

---

## 💰 COMMISSION RATES

### **Flat Rate Mode**
- Single rate for all sellers
- Example: 10% commission

### **Tier-Based Mode**
- **New**: 15% (0-49 orders)
- **Standard**: 10% (50-199 orders, ₹50K+ revenue)
- **Premium**: 5% (200+ orders, ₹200K+ revenue)

---

## 📊 KEY METRICS

**Admin Dashboard Shows**:
- Total commission earned
- Pending payouts
- Processing payouts
- Completed payouts
- Top sellers
- Commission trends

---

## ⏰ AUTOMATED SCHEDULE

**Every Monday at 00:00**:
- System generates payouts for last week
- Only includes orders past 24-hour hold
- Sellers receive notification
- Admin reviews and approves

---

## 🔔 NOTIFICATIONS

**Sellers Receive**:
- Payout generated notification
- Payment completed notification
- Amount and transaction details

---

## 🎯 QUICK ACTIONS

### **Approve Payout**
`/admin/payouts` → Click "Approve" → Status: Processing

### **Mark as Paid**
Click "Mark as Paid" → Enter TXN ID → Status: Completed

### **Add Penalty**
Edit payout → Adjustments: -500 → Net payout reduced

### **Add Bonus**
Edit payout → Adjustments: +1000 → Net payout increased

---

## 📱 SELLER VIEW

**Sellers Can See**:
- Current week pending earnings
- Payout history
- Commission breakdown
- Payment status
- Transaction IDs

**Location**: `/seller/payouts`

---

## 🔧 TROUBLESHOOTING

**Payout not generated?**
- Check if orders are past 24-hour hold
- Verify order status is 'delivered'
- Ensure seller is approved

**Wrong commission amount?**
- Check commission settings
- Verify tier-based mode if enabled
- Review order commission details

**Seller not receiving notification?**
- Check Notification model
- Verify seller ID is correct
- Check notification API

---

## 📞 SUPPORT

**For Technical Issues**:
- Check `/api/admin/payouts` logs
- Review Order model payoutStatus
- Verify Commission settings

**For Business Questions**:
- Review analytics dashboard
- Check commission calculator
- Export payout reports

---

## ✅ CHECKLIST

**Weekly Admin Tasks**:
- [ ] Generate payouts (Monday)
- [ ] Review pending payouts
- [ ] Approve valid payouts
- [ ] Process bank transfers
- [ ] Mark as paid with TXN IDs
- [ ] Check analytics dashboard
- [ ] Review top sellers

**Monthly Admin Tasks**:
- [ ] Review commission rates
- [ ] Analyze revenue trends
- [ ] Update tier requirements
- [ ] Check seller performance
- [ ] Export financial reports

---

**SYSTEM IS LIVE AND READY TO USE!** 🎉
