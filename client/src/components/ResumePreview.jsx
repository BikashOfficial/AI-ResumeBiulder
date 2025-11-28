import React from 'react'
import ModernTemplate from './templates/ModernTemplate'
import ClassicTemplate from './templates/ClassicTemplate'
import MinimalTemplate from './templates/MinimalTemplate'
import MinimalImageTemplate from './templates/MinimalImageTemplate'

const ResumePreview = ({ data, template, accentColor, classes = "" }) => {

    const renderTemplate = () => {
        switch (template) {
            case "modern":
                return <ModernTemplate data={data} accentColor={accentColor} />
            case "classic":
                return <ClassicTemplate data={data} accentColor={accentColor} />
            case "minimal":
                return <MinimalTemplate data={data} accentColor={accentColor} />
            default:
                return <MinimalImageTemplate data={data} accentColor={accentColor} />
        }
    }

    return (
        <div className='w-full bg-gray-100'>
            <div
                className={'border border-gray-200 print:shadow-none print:border-none' + classes}
                id='resume-preview'
            >
                {renderTemplate()}

            </div>

            <style jsx>
                {`  
                    @page {
                    size: letter;
                    margin: 0;
                    }

                    @media print {

                    html,
                    body {
                        width: 8.5in;
                        height: 11in;
                        overflow: hidden;
                    }

                    body * {
                        visibility: hidden;
                    }

                    #resume-preview,
                    #resume-preview * {
                        visibility: visible;
                    }

                    #resume-preview {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: auto;
                        margin: 0;
                        padding: 0;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    /* Force browsers to try and preserve element colors when printing.
                       Note: many browsers still require the user to enable "Print Background Colors"
                       (Chrome: "Background graphics") in the print dialog. */
                    #resume-preview, #resume-preview * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    }
                `}
            </style>
        </div>
    )
}

export default ResumePreview