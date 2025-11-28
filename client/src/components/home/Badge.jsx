import React from 'react'
import { AirVent, Sparkles, Zap } from 'lucide-react'

const Badge = () => {
    return (
        <div className="flex items-center gap-2 text-sm text-green-800 bg-green-400/10  rounded-full px-6 py-1.5">
            <Sparkles width={18} className=' stroke-green-600' />
            <span>simple process & AI automated </span>
        </div>
    )
}

export default Badge