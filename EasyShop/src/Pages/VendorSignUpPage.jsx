
import { useEffect, useState } from "react";
import VendorAccountInfo from "../Components/VendorAccountInfo";
import VendorBusinessInfo from "../Components/VendorBusinessInfo";
import VendorPersonalInfo from "../Components/VendorPersonalInfo";
import { useCatList } from "../hook/useVendor";
import { useTranslation } from 'react-i18next';

function VendorSignupPage() {

    const { t } = useTranslation();
    const { data: categories = [], isLoading: isCatLoading, isError, error } = useCatList();

    const [step, setStep] = useState(1);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [formData, setFormData] = useState({

        // step 1
        name: "",
        email: "",
        contact: "",
        password: "",
        confirmPassword: "",
        profilePhoto: null,

        // step 2
        storeLogo: null,
        storeName: "",
        businessEmail: "",
        businessContact: "",
        businessType: "",
        category: "",
        categoryLicenseUpload: null,
        address: "",
        city: "",
        state: "",
        pincode: "",
        businessPAN: "",
        panCardUpload: null,
        gstNumber: "",
        gstDocumentUpload: null,

        // step 3
        accHolder: "",
        bank: "",
        accNumber: "",
        ifsc: "",
        bankDocumentUpload: null,
        otp: ""
    });

    // Jab step 1 se 2 ya 2 se 3 hoga, scroll top par jayega
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [step]);

    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => prev - 1);

    // Steps Configuration
    const stepsLabels = [
        t('steps.Personal Info'),
        t('steps.Business Details'),
        t('steps.Bank & Agreement')
    ];

    return (
        <div className="min-h-[70vh] bg-gray-50 py-10 px-4 lg:px-6">
            <div className="max-w-4xl mx-auto ">

                {/* --- Progress Bar --- */}
                <div className="mb-12 relative flex justify-between max-w-2xl mx-auto">

                    {/* Background Gray Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>

                    {/* Active Pink Line (Dynamic) */}
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-pink-500 -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
                        style={{ width: `${((step - 1) / (stepsLabels.length - 1)) * 100}%` }}
                    ></div>

                    {/* Step Circles */}
                    {stepsLabels.map((label, index) => {
                        const stepNumber = index + 1;
                        return (
                            <div
                                key={index}
                                className="relative z-10 flex flex-col items-center">
                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 
                                ${step >= stepNumber
                                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-200'
                                        : 'bg-white border-2 border-gray-200 text-gray-400'
                                    }`}>
                                    {step > stepNumber ? '✓' : stepNumber}
                                </div>

                                {/* Text Label: Mobile par wrap hoga aur Desktop par nowrap */}
                                <div className={`hidden md:block absolute -bottom-8 md:-bottom-10 w-16 sm:w-20 md:w-32 px-2 md:px-6 text-center transition-all duration-300`}>
                                    <span className={`block text-[8px] sm:text-[10px] md:text-xs font-bold uppercase tracking-tighter sm:tracking-normal leading-[1.1]
                                    ${step >= stepNumber ? 'text-pink-500' : 'text-gray-400'}`}>
                                        {label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {/* --- End Progress Bar --- */}

                {/* Form Content */}
                <div className="bg-pink-50/30 rounded-[25px] md:rounded-[30px] shadow-sm p-6 md:p-12 border border-gray-100 mt-12 md:mt-16">
                    {step === 1 &&
                        <VendorPersonalInfo
                            next={nextStep}
                            formData={formData}
                            setFormData={setFormData}
                            isEmailVerified={isEmailVerified}
                            setIsEmailVerified={setIsEmailVerified} />
                    }

                    {step === 2 &&
                        <VendorBusinessInfo
                            next={nextStep}
                            prev={prevStep}
                            formData={formData}
                            setFormData={setFormData}
                            categories={categories}
                            isCatLoading={isCatLoading} />
                    }

                    {step === 3 &&
                        <VendorAccountInfo
                            prev={prevStep}
                            formData={formData}
                            setFormData={setFormData} />
                    }
                </div>
            </div>
        </div>
    );
};

export default VendorSignupPage;