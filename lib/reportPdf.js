import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
    header: { marginBottom: 24, borderBottom: "2 solid #4F46E5", paddingBottom: 12 },
    title: { fontSize: 22, fontWeight: "bold", color: "#1E293B" },
    subtitle: { fontSize: 11, color: "#64748B", marginTop: 4 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 14, fontWeight: "bold", color: "#1E293B", marginBottom: 8 },
    aqiBox: { backgroundColor: "#F8FAFC", padding: 16, borderRadius: 8, marginBottom: 12 },
    aqiNumber: { fontSize: 36, fontWeight: "bold" },
    aqiLabel: { fontSize: 11, color: "#64748B", marginTop: 4 },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    label: { color: "#64748B" },
    value: { fontWeight: "bold", color: "#1E293B" },
    forecastRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottom: "1 solid #E2E8F0" },
    footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 9, color: "#94A3B8", textAlign: "center" },
});

function getBandLabel(aqi) {
    if (aqi <= 50) return { label: "Good", color: "#10B981" };
    if (aqi <= 100) return { label: "Moderate", color: "#F59E0B" };
    if (aqi <= 200) return { label: "Poor", color: "#F97316" };
    if (aqi <= 300) return { label: "Severe", color: "#EF4444" };
    return { label: "Hazardous", color: "#7F1D1D" };
}

export function ReportDocument({ city, cityData }) {
    const band = getBandLabel(cityData.aqi);
    const pollutants = cityData.pollutants || {};
    const forecast = cityData.forecast7Day || [];

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>AirSense AI — Air Quality Report</Text>
                    <Text style={styles.subtitle}>{city} · Generated on {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.aqiBox}>
                        <Text style={[styles.aqiNumber, { color: band.color }]}>{cityData.aqi}</Text>
                        <Text style={styles.aqiLabel}>Current AQI — {band.label}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pollutant Breakdown</Text>
                    <View style={styles.row}><Text style={styles.label}>PM2.5</Text><Text style={styles.value}>{pollutants.pm25 ?? "—"} µg/m³</Text></View>
                    <View style={styles.row}><Text style={styles.label}>PM10</Text><Text style={styles.value}>{pollutants.pm10 ?? "—"} µg/m³</Text></View>
                    <View style={styles.row}><Text style={styles.label}>NO₂</Text><Text style={styles.value}>{pollutants.no2 ?? "—"} µg/m³</Text></View>
                    <View style={styles.row}><Text style={styles.label}>SO₂</Text><Text style={styles.value}>{pollutants.so2 ?? "—"} µg/m³</Text></View>
                    <View style={styles.row}><Text style={styles.label}>CO</Text><Text style={styles.value}>{pollutants.co ?? "—"} mg/m³</Text></View>
                    <View style={styles.row}><Text style={styles.label}>O₃</Text><Text style={styles.value}>{pollutants.o3 ?? "—"} µg/m³</Text></View>
                </View>

                {forecast.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>7-Day Forecast</Text>
                        {forecast.map((f, i) => (
                            <View key={i} style={styles.forecastRow}>
                                <Text style={styles.label}>{f.day}</Text>
                                <Text style={styles.value}>{f.aqi} AQI</Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Health Advisory</Text>
                    <Text>
                        {cityData.aqi <= 100
                            ? "Air quality is acceptable. Outdoor activities are safe for most people."
                            : "Sensitive groups (children, elderly, those with respiratory conditions) should limit prolonged outdoor exertion. Consider wearing a mask outdoors and using air purifiers indoors."}
                    </Text>
                </View>

                <Text style={styles.footer}>
                    AirSense AI · Instrument-grade air quality forecasting · This report is auto-generated and for informational purposes only.
                </Text>
            </Page>
        </Document>
    );
}

export async function generateReportPdfBuffer({ city, cityData }) {
    return await renderToBuffer(<ReportDocument city={city} cityData={cityData} />);
}