import { Mail, Phone, MapPin, Linkedin, Globe, Calendar } from "lucide-react";

const MinimalImageTemplate = ({ data, accentColor = "#0f766e" }) => {
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
            : "15, 118, 110";
    };
    const rgb = hexToRgb(accentColor);

    const getImageSrc = () => {
        if (!data?.personal_info?.image) return null;
        if (typeof data.personal_info.image === "string") return data.personal_info.image;
        if (typeof data.personal_info.image === "object") return URL.createObjectURL(data.personal_info.image);
        return null;
    };
    const imgSrc = getImageSrc();

    return (
        <div
            className="max-w-5xl mx-auto bg-white text-zinc-800"
            style={{
                fontFamily: "'DM Sans', 'Trebuchet MS', sans-serif",
                fontSize: "14.8px",   // ⬆️ increased base
                lineHeight: "1.55"
            }}
        >
            {/* HEADER */}
            <header
                style={{
                    background: `linear-gradient(120deg, rgba(${rgb},0.96) 0%, rgba(${rgb},0.80) 100%)`,
                    padding: "26px 34px 22px",
                    display: "grid",
                    gridTemplateColumns: imgSrc ? "auto 1fr" : "1fr",
                    gap: "22px",
                    alignItems: "center",
                }}
            >
                {imgSrc && (
                    <img
					className=""
                        src={imgSrc}
                        alt="Profile"
                        style={{
                            width: "90px",
                            height: "90px",
                            borderRadius: "50%",
                            objectFit: "cover",
							
                            border: "3px solid rgba(255,255,255,0.5)",
                        }}
                    />
                )}

                <div>
                    <h1 style={{
                        color: "#fff",
                        fontSize: "29px",   // ⬆️ increased
                        fontWeight: "700",
                        margin: 0
                    }}>
                        {data?.personal_info?.full_name || "Your Name"}
                    </h1>

                    {data?.personal_info?.profession && (
                        <p style={{
                            color: "rgba(255,255,255,0.8)",
                            fontSize: "13.5px",
                            letterSpacing: "0.12em",
                            marginTop: "5px"
                        }}>
                            {data.personal_info.profession}
                        </p>
                    )}

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 16px", marginTop: "10px" }}>
                        {data?.personal_info?.email && <HeaderContact icon={<Mail size={13} />} text={data.personal_info.email} />}
                        {data?.personal_info?.phone && <HeaderContact icon={<Phone size={13} />} text={data.personal_info.phone} />}
                        {data?.personal_info?.location && <HeaderContact icon={<MapPin size={13} />} text={data.personal_info.location} />}
                        {data?.personal_info?.linkedin && <HeaderContact icon={<Linkedin size={13} />} text={data.personal_info.linkedin} />}
                        {data?.personal_info?.website && <HeaderContact icon={<Globe size={13} />} text={data.personal_info.website} />}
                    </div>
                </div>
            </header>

            {/* BODY */}
            <div style={{ display: "grid", gridTemplateColumns: "210px 1fr" }}>

                {/* SIDEBAR */}
                <aside style={{
                    background: `rgba(${rgb},0.04)`,
                    borderRight: `1px solid rgba(${rgb},0.12)`,
                    padding: "20px 16px",
                }}>
                    <SideSection title="Education" accentColor={accentColor}>
                        {data.education?.map((edu, i) => (
                            <div key={i} style={{ marginBottom: "10px" }}>
                                <p style={{ fontSize: "14px", fontWeight: 600 }}>{edu.degree}</p>
                                <p style={{ fontSize: "13px", color: "#666" }}>{edu.institution}</p>
                                <p style={{ fontSize: "12.5px", color: accentColor }}>
                                    {formatDate(edu.graduation_date)}
                                </p>
                            </div>
                        ))}
                    </SideSection>

                    <SideSection title="Skills" accentColor={accentColor}>
                        {data.skills?.map((skill, i) => (
                            <p key={i} style={{ fontSize: "13px", marginBottom: "4px" }}>
                                • {skill}
                            </p>
                        ))}
                    </SideSection>
                </aside>

                {/* MAIN */}
                <main style={{ padding: "20px 26px" }}>

                    <MainSection title="Summary" accentColor={accentColor}>
                        <p style={{ fontSize: "14.5px", color: "#444" }}>
                            {data.professional_summary}
                        </p>
                    </MainSection>

                    <MainSection title="Experience" accentColor={accentColor}>
                        {data.experience?.map((exp, i) => (
                            <ExperienceItem key={i} exp={exp} accentColor={accentColor} formatDate={formatDate} />
                        ))}
                    </MainSection>

                    <MainSection title="Projects" accentColor={accentColor}>
                        {data.project?.map((proj, i) => (
                            <div key={i} style={{ marginBottom: "10px" }}>
                                <h3 style={{ fontSize: "14.5px", fontWeight: 600 }}>
                                    {proj.name}
                                </h3>
                                <p style={{ fontSize: "13.5px", color: "#555" }}>
                                    {proj.description}
                                </p>
                            </div>
                        ))}
                    </MainSection>
                </main>
            </div>
        </div>
    );
};

/* COMPONENTS */

const HeaderContact = ({ icon, text }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "white", fontSize: "13px" }}>
        {icon}
        <span>{text}</span>
    </div>
);

const SideSection = ({ title, accentColor, children }) => (
    <div style={{ marginBottom: "18px" }}>
        <h2 style={{ fontSize: "13px", color: accentColor, marginBottom: "6px" }}>
            {title}
        </h2>
        {children}
    </div>
);

const MainSection = ({ title, accentColor, children }) => (
    <div style={{ marginBottom: "18px" }}>
        <h2 style={{ fontSize: "13px", color: accentColor, marginBottom: "8px" }}>
            {title}
        </h2>
        {children}
    </div>
);

const ExperienceItem = ({ exp, accentColor, formatDate }) => (
    <div style={{ marginBottom: "12px" }}>
        <h3 style={{ fontSize: "14.5px", fontWeight: 600 }}>
            {exp.position}
        </h3>
        <p style={{ fontSize: "13.5px", color: accentColor }}>
            {exp.company}
        </p>
        <p style={{ fontSize: "12.5px", color: "#777" }}>
            {formatDate(exp.start_date)} – {exp.is_current ? "Present" : formatDate(exp.end_date)}
        </p>

        {exp.description && (
            <ul style={{ marginTop: "4px", paddingLeft: "16px" }}>
                {exp.description.split("\n").map((line, i) => (
                    <li key={i} style={{ fontSize: "13.5px", color: "#555" }}>
                        {line}
                    </li>
                ))}
            </ul>
        )}
    </div>
);

export default MinimalImageTemplate;