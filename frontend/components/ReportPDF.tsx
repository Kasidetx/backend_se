"use client";

import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// ต้อง Register ฟอนต์ภาษาไทยก่อนใช้งาน (สมมติว่าเอาไฟล์ไปวางใน public/fonts/ แล้ว)
Font.register({
    family: "THSarabun",
    src: "/fonts/THSarabunNew.ttf", // เปลี่ยน Path ให้ตรงกับที่คุณเก็บไฟล์ฟอนต์ไว้
});

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: "THSarabun", fontSize: 16 },
    header: { fontSize: 24, textAlign: "center", marginBottom: 20, fontWeight: "bold" },
    section: { marginBottom: 15 },
    row: { flexDirection: "row", borderBottom: "1px solid #ccc", paddingVertical: 5 },
    colTitle: { width: "40%", fontWeight: "bold" },
    colTime: { width: "40%", textAlign: "center" },
    colHours: { width: "20%", textAlign: "right", fontWeight: "bold" },
    totalBox: { marginTop: 20, textAlign: "right", fontSize: 18, fontWeight: "bold", color: "green" }
});

export default function ReportPDF({ data }: { data: any }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.header}>รายงานประวัติการทำกิจกรรมจิตอาสา</Text>

                <View style={styles.section}>
                    <Text>รหัสนักศึกษา: {data.student.student_id}</Text>
                    <Text>ชื่อ-นามสกุล: {data.student.first_name} {data.student.last_name}</Text>
                </View>

                {/* หัวตาราง */}
                <View style={[styles.row, { backgroundColor: "#f0f0f0", fontWeight: "bold" }]}>
                    <Text style={styles.colTitle}>ชื่องานกิจกรรม</Text>
                    <Text style={styles.colTime}>เวลา Check-in / Check-out</Text>
                    <Text style={styles.colHours}>ชั่วโมงที่ได้</Text>
                </View>

                {/* รายการกิจกรรม */}
                {data.activities.map((act: any, index: number) => (
                    <View key={index} style={styles.row}>
                        <Text style={styles.colTitle}>{act.title}</Text>
                        <Text style={styles.colTime}>
                            {new Date(act.check_in_time).toLocaleString("th-TH")} - {new Date(act.check_out_time).toLocaleString("th-TH").split(" ")[1]}
                        </Text>
                        <Text style={styles.colHours}>{Number(act.earned_hours).toFixed(2)}</Text>
                    </View>
                ))}

                <Text style={styles.totalBox}>รวมชั่วโมงกิจกรรมทั้งหมด: {data.totalHours} ชั่วโมง</Text>
            </Page>
        </Document>
    );
}