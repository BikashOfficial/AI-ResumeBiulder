const MinimalTemplate = ({ data, accentColor = "#1a1a1a" }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        return new Date(year, month - 1).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
        });
    };

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : "26, 26, 26";
    };
    const rgb = hexToRgb(accentColor);

    return (
        <div
            className="max-w-4xl mx-auto bg-white text-gray-900"
            style={{ fontFamily: "'Garamond', 'EB Garamond', 'Georgia', serif", fontSize: "14px", lineHeight: "1.6" }}
        >
            {/* ── LEFT ACCENT LINE ── */}
            <div style={{ display: "flex" }}>
                <div style={{ width: "3px", background: accentColor, flexShrink: 0, alignSelf: "stretch", opacity: 0.85 }} />

                <div style={{ flex: 1, padding: "32px 40px" }}>

                    {/* ── HEADER ── */}
                    <header style={{ marginBottom: "28px" }}>
                        <h1
                            style={{
                                fontSize: "34px",
                                fontWeight: "300",
                                letterSpacing: "0.06em",
                                color: "#111",
                                margin: "0 0 4px 0",
                                fontFamily: "'Garamond', 'EB Garamond', 'Georgia', serif",
                                lineHeight: 1.15,
                            }}
                        >
                            {data?.personal_info?.full_name || "Your Name"}
                        </h1>

                        {data?.personal_info?.profession && (
                            <p style={{
                                fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase",
                                color: accentColor, margin: "0 0 14px 0", fontWeight: "400",
                                opacity: 0.9,
                            }}>
                                {data.personal_info.profession}
                            </p>
                        )}

                        {/* Thin rule */}
                        <div style={{ height: "1px", background: `rgba(${rgb},0.2)`, margin: "12px 0" }} />

                        {/* Contact — pipe-separated */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 0", fontSize: "12.5px", color: "#666" }}>
                            {[
                                data?.personal_info?.email,
                                data?.personal_info?.phone,
                                data?.personal_info?.location,
                                data?.personal_info?.linkedin,
                                data?.personal_info?.website,
                            ]
                                .filter(Boolean)
                                .map((item, i, arr) => (
                                    <span key={i} style={{ display: "flex", alignItems: "center" }}>
                                        <span>{item}</span>
                                        {i < arr.length - 1 && (
                                            <span style={{ margin: "0 10px", color: `rgba(${rgb},0.35)`, fontWeight: 300 }}>|</span>
                                        )}
                                    </span>
                                ))}
                        </div>
                    </header>

                    {/* ── SUMMARY ── */}
                    {data?.professional_summary && (
                        <section style={{ marginBottom: "24px" }}>
                            <p style={{
                                fontSize: "14px", color: "#444", lineHeight: "1.75",
                                fontStyle: "italic", margin: 0,
                                borderLeft: `2px solid rgba(${rgb},0.2)`,
                                paddingLeft: "14px",
                            }}>
                                {data.professional_summary}
                            </p>
                        </section>
                    )}

                    {/* ── EXPERIENCE ── */}
                    {data?.experience?.length > 0 && (
                        <Section title="Experience" accentColor={accentColor} rgb={rgb}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                                {data.experience.map((exp, i) => (
                                    <div key={i}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                            <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#111", margin: 0 }}>
                                                {exp.position}
                                            </h3>
                                            <span style={{ fontSize: "12px", color: "#999", whiteSpace: "nowrap", marginLeft: "12px" }}>
                                                {formatDate(exp.start_date)} – {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: "13px", color: accentColor, margin: "2px 0 6px", fontWeight: "500", opacity: 0.85 }}>
                                            {exp.company}
                                        </p>
                                        {exp.description && (
                                            <p style={{ fontSize: "13.5px", color: "#555", lineHeight: "1.7", margin: 0, whiteSpace: "pre-line" }}>
                                                {exp.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* ── PROJECTS ── */}
                    {data?.project?.length > 0 && (
                        <Section title="Projects" accentColor={accentColor} rgb={rgb}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {data.project.map((proj, i) => (
                                    <div key={i} style={{ display: "flex", gap: "16px", alignItems: "baseline" }}>
                                        <span style={{
                                            fontSize: "12px", color: accentColor, opacity: 0.5,
                                            fontWeight: 300, flexShrink: 0, lineHeight: "22px",
                                        }}>
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <div>
                                            <h3 style={{ fontSize: "14.5px", fontWeight: "600", color: "#111", margin: 0 }}>
                                                {proj.name}
                                            </h3>
                                            <p style={{ fontSize: "13px", color: "#666", margin: "3px 0 0", lineHeight: "1.65" }}>
                                                {proj.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* ── EDUCATION ── */}
                    {data?.education?.length > 0 && (
                        <Section title="Education" accentColor={accentColor} rgb={rgb}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {data.education.map((edu, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div>
                                            <h3 style={{ fontSize: "14.5px", fontWeight: "600", color: "#111", margin: 0 }}>
                                                {edu.degree}
                                                {edu.field && <span style={{ fontWeight: 400, color: "#555" }}> in {edu.field}</span>}
                                            </h3>
                                            <p style={{ fontSize: "13px", color: "#777", margin: "2px 0 0" }}>{edu.institution}</p>
                                            {edu.gpa && <p style={{ fontSize: "12px", color: "#999", margin: "1px 0 0" }}>GPA: {edu.gpa}</p>}
                                        </div>
                                        <span style={{ fontSize: "12px", color: "#999", whiteSpace: "nowrap", marginLeft: "16px" }}>
                                            {formatDate(edu.graduation_date)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* ── SKILLS ── */}
                    {data?.skills?.length > 0 && (
                        <Section title="Skills" accentColor={accentColor} rgb={rgb} last>
                            <p style={{ fontSize: "13.5px", color: "#555", margin: 0, lineHeight: "1.9", letterSpacing: "0.01em" }}>
                                {data.skills.map((skill, i) => (
                                    <span key={i}>
                                        {skill}
                                        {i < data.skills.length - 1 && (
                                            <span style={{ margin: "0 8px", color: `rgba(${rgb},0.3)` }}>·</span>
                                        )}
                                    </span>
                                ))}
                            </p>
                        </Section>
                    )}

                </div>
            </div>
        </div>
    );
};

/* ── SECTION COMPONENT ── */
const Section = ({ title, accentColor, rgb, children, last }) => (
    <section style={{ marginBottom: last ? 0 : "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
            <h2 style={{
                fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.22em",
                textTransform: "uppercase", color: accentColor, margin: 0,
                whiteSpace: "nowrap",
            }}>
                {title}
            </h2>
            <div style={{ flex: 1, height: "1px", background: `rgba(${rgb},0.15)` }} />
        </div>
        {children}
    </section>
);

export default MinimalTemplate;