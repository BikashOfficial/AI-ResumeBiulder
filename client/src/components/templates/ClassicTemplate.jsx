import { Mail, Phone, MapPin, Linkedin, Globe, Calendar } from "lucide-react";

const ClassicTemplate = ({ data, accentColor = "#1a3a5c" }) => {
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
            : "26, 58, 92";
    };
    const rgb = hexToRgb(accentColor);

    return (
        <div
            className="max-w-4xl mx-auto bg-white text-gray-800"
            style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "15.5px",   // ⬆️ increased base
                lineHeight: "1.55"
            }}
        >
            {/* TOP BAR */}
            <div style={{ height: "4px", background: accentColor }} />

            {/* HEADER */}
            <header
                className="px-8 pt-4 pb-3"
                style={{
                    background: `linear-gradient(135deg, rgba(${rgb},0.07) 0%, rgba(${rgb},0.02) 100%)`,
                    borderBottom: `1px solid rgba(${rgb},0.18)`,
                }}
            >
                <h1
                    className="text-center uppercase tracking-widest mb-1"
                    style={{
                        color: accentColor,
                        fontSize: "27px",   // ⬆️ increased
                        letterSpacing: "0.18em",
                        fontFamily: "'Georgia', serif"
                    }}
                >
                    {data?.personal_info?.full_name || "Your Name"}
                </h1>

                {/* Divider */}
                <div className="flex items-center justify-center gap-2 mb-2">
                    <div style={{ height: "1px", width: "50px", background: accentColor, opacity: 0.4 }} />
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: accentColor, opacity: 0.7 }} />
                    <div style={{ height: "1px", width: "50px", background: accentColor, opacity: 0.4 }} />
                </div>

                {/* Contact */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-0.5 text-gray-600"
                    style={{ fontSize: "13.5px" }}>
                    {data?.personal_info?.email && <ContactItem icon={<Mail size={12} />} text={data.personal_info.email} />}
                    {data?.personal_info?.phone && <ContactItem icon={<Phone size={12} />} text={data.personal_info.phone} />}
                    {data?.personal_info?.location && <ContactItem icon={<MapPin size={12} />} text={data.personal_info.location} />}
                    {data?.personal_info?.linkedin && <ContactItem icon={<Linkedin size={12} />} text={data.personal_info.linkedin} />}
                    {data?.personal_info?.website && <ContactItem icon={<Globe size={12} />} text={data.personal_info.website} />}
                </div>
            </header>

            {/* BODY */}
            <div className="px-8 py-4 space-y-3">

                {/* SUMMARY */}
                {data?.professional_summary && (
                    <Section title="Professional Summary" accentColor={accentColor} rgb={rgb}>
                        <p
                            className="text-gray-700"
                            style={{
                                fontSize: "14.5px",
                                fontStyle: "italic",
                                borderLeft: `3px solid rgba(${rgb},0.25)`,
                                paddingLeft: "10px",
                            }}
                        >
                            {data.professional_summary}
                        </p>
                    </Section>
                )}

                {/* EXPERIENCE */}
                {data?.experience?.length > 0 && (
                    <Section title="Professional Experience" accentColor={accentColor} rgb={rgb}>
                        <div className="space-y-3">
                            {data.experience.map((exp, i) => (
                                <ExperienceItem key={i} exp={exp} accentColor={accentColor} rgb={rgb} formatDate={formatDate} />
                            ))}
                        </div>
                    </Section>
                )}

                {/* PROJECTS */}
                {data?.project?.length > 0 && (
                    <Section title="Projects" accentColor={accentColor} rgb={rgb}>
                        <div className="space-y-2">
                            {data.project.map((proj, i) => (
                                <div key={i} className="flex gap-2">
                                    <div style={{ width: "3px", background: `rgba(${rgb},0.3)` }} />
                                    <div>
                                        <h3 style={{ fontSize: "15px", fontFamily: "'Georgia', serif" }} className="font-semibold text-gray-800">
                                            {proj.name}
                                        </h3>
                                        <p style={{ fontSize: "14px" }} className="text-gray-600">
                                            {proj.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* EDUCATION */}
                {data?.education?.length > 0 && (
                    <Section title="Education" accentColor={accentColor} rgb={rgb}>
                        <div className="space-y-2">
                            {data.education.map((edu, i) => (
                                <div key={i} className="flex justify-between items-start">
                                    <div>
                                        <h3 style={{ fontSize: "15px", fontFamily: "'Georgia', serif" }} className="font-semibold text-gray-800">
                                            {edu.degree}
                                            {edu.field && <span className="font-normal text-gray-600"> in {edu.field}</span>}
                                        </h3>
                                        <p style={{ fontSize: "14px" }} className="text-gray-600">
                                            {edu.institution}
                                        </p>
                                    </div>
                                    <DateBadge text={formatDate(edu.graduation_date)} rgb={rgb} />
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* SKILLS */}
                {data?.skills?.length > 0 && (
                    <Section title="Core Skills" accentColor={accentColor} rgb={rgb}>
                        <div className="flex flex-wrap gap-1.5">
                            {data.skills.map((skill, i) => (
                                <span
                                    key={i}
                                    style={{
                                        fontSize: "13.5px",
                                        border: `1px solid rgba(${rgb},0.35)`,
                                        color: accentColor,
                                        padding: "2px 8px",
                                        borderRadius: "2px",
                                        background: `rgba(${rgb},0.04)`,
                                        fontFamily: "'Georgia', serif",
                                    }}
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </Section>
                )}
            </div>

            {/* BOTTOM BAR */}
            <div style={{ height: "3px", background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
        </div>
    );
};

/* SUB COMPONENTS */

const ContactItem = ({ icon, text }) => (
    <div className="flex items-center gap-1">
        <span className="opacity-60">{icon}</span>
        <span>{text}</span>
    </div>
);

const Section = ({ title, accentColor, rgb, children }) => (
    <section>
        <div className="flex items-center gap-2 mb-2">
            <h2
                style={{
                    color: accentColor,
                    fontSize: "13px",   // ⬆️ increased
                    letterSpacing: "0.2em",
                    fontFamily: "'Georgia', serif"
                }}
                className="uppercase tracking-widest"
            >
                {title}
            </h2>
            <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, rgba(${rgb},0.5), rgba(${rgb},0.08))` }} />
        </div>
        {children}
    </section>
);

const DateBadge = ({ text, rgb }) => (
    <span
        className="flex items-center gap-1 whitespace-nowrap"
        style={{ fontSize: "12.5px", color: `rgba(${rgb},0.7)` }}
    >
        <Calendar size={12} />
        {text}
    </span>
);

const ExperienceItem = ({ exp, accentColor, rgb, formatDate }) => (
    <div>
        <div className="flex justify-between items-start">
            <div>
                <h3 style={{ fontSize: "15px", fontFamily: "'Georgia', serif" }} className="font-semibold text-gray-900">
                    {exp.position}
                </h3>
                <p style={{ fontSize: "14px", color: accentColor, opacity: 0.85 }}>
                    {exp.company}
                </p>
            </div>

            <DateBadge
                text={`${formatDate(exp.start_date)} – ${exp.is_current ? "Present" : formatDate(exp.end_date)}`}
                rgb={rgb}
            />
        </div>

        <div style={{ height: "1px", background: `rgba(${rgb},0.12)`, margin: "4px 0" }} />

        {exp.description && (
            <p style={{ fontSize: "14px" }} className="text-gray-700 whitespace-pre-line">
                {exp.description}
            </p>
        )}
    </div>
);

export default ClassicTemplate;