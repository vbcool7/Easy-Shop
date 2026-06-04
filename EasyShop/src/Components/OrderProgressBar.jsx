
import { useTranslation } from 'react-i18next';

function OrderProgressBar({ orderStatus }) {

    const { t } = useTranslation();

    const allSteps = [
        { key: "Pending", label: t('orderProgress.placed') },
        { key: "Processing", label: t('orderProgress.confirmed') },
        { key: "Shipped", label: t('orderProgress.courier') },
        { key: "Delivered", label: t('orderProgress.delivered') },
        { key: "Cancelled", label: t('orderProgress.cancelled') },
    ];

    const steps = orderStatus === 'Cancelled'
        ? allSteps.filter(s => s.key !== 'Delivered' && s.key !== 'Shipped')
        : allSteps.filter(s => s.key !== 'Cancelled');

    const stepMap = orderStatus === 'Cancelled'
        ? { Pending: 1, Processing: 2, Cancelled: 3 }
        : { Pending: 1, Processing: 2, Shipped: 3, Delivered: 4 };

    const current = stepMap[orderStatus] || 1;
    const total = steps.length;
    const progress = (current - 1) / (total - 1); // 0 to 1

    return (
        <div className="max-w-6xl mx-auto my-10 px-4">
            <div className="relative flex justify-between items-start">

                {/* Background line — from center of first to center of last circle */}
                <div className="absolute top-5 bg-slate-100 z-0"
                    style={{ left: '20px', right: '20px', height: '3px' }} />

                {/* Active pink line */}
                <div
                    className="absolute top-5 bg-pink-500 z-0 transition-all duration-700"
                    style={{
                        left: '20px',
                        height: '3px',
                        width: `calc((100% - 40px) * ${progress})`
                    }}
                />

                {/* Steps */}
                {steps.map((step, index) => {
                    const n = index + 1;
                    const isDone = n < current;
                    const isActive = n === current;
                    const showCheck = isDone || (isActive && current === total);

                    return (
                        <div key={step.key} className="relative z-10 flex flex-col items-center gap-3"
                            style={{ width: '40px' }}>

                            {/* Circle — exactly 40px wide */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 border-white shrink-0 transition-all duration-500
                                ${isDone || isActive
                                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-100'
                                    : 'bg-slate-100 text-slate-400'}`}>
                                {showCheck ? '✓ ' : n}
                            </div>

                            {/* Label — positioned absolutely so it doesn't affect layout */}
                            <p className={`absolute top-12 text-[9px] md:text-[10px] font-bold uppercase tracking-tight text-center w-20 -translate-x-1/2 left-1/2
                                ${isDone || isActive ? 'text-pink-500 ' : 'text-slate-400'}`}>
                                {step.label}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Space for labels */}
            <div className="h-10" />
        </div>
    );
}

export default OrderProgressBar;