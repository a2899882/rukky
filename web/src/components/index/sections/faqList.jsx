import {Disclosure, DisclosureButton, DisclosurePanel} from "@headlessui/react";
import {MinusSmallIcon, PlusSmallIcon} from "@heroicons/react/24/outline";
import lang from "@/locales";




const faqs = [
    {
        question: "What are your minimum order quantities (MOQ)?",
        answer:
            "Our standard MOQ varies by product category. For most products, we require a minimum order of 500 units. However, for specialized or customized items, this may increase to 1,000 units. We offer tiered pricing to make larger orders more economical. Please contact our sales team for specific product MOQs.",
    },
    {
        question: "What international shipping and logistics options do you provide?",
        answer:
            "We offer comprehensive international shipping solutions including FOB, CIF, EXW, and DDP terms. We partner with reliable logistics providers like DHL, FedEx, and Maersk for air and sea freight. All shipments are fully insured and trackable through our client portal. We also handle all export documentation and customs clearance procedures.",
    },
    {
        question: "What payment methods do you accept for international orders?",
        answer:
            "We accept secure international payments via T/T (wire transfer), L/C (Letter of Credit), D/P, and major credit cards through our secure payment gateway. For new clients, we typically require a 30% deposit with the balance due before shipment. Established clients may qualify for 30-60 day payment terms after credit approval.",
    },
    {
        question: "Can you provide product customization and OEM/ODM services?",
        answer:
            "Yes, we specialize in product customization and OEM/ODM services. We can customize packaging, branding, product specifications, and even develop entirely new products based on your requirements. Our R&D team works closely with clients to ensure all customizations meet international quality standards and market requirements.",
    },
    {
        question: "What quality control measures do you have in place?",
        answer:
            "We implement a rigorous multi-stage quality control process compliant with ISO 9001 standards. This includes incoming material inspection, in-process quality checks, and pre-shipment inspection. We also offer third-party inspection services through SGS or Bureau Veritas. All products come with quality certificates and warranty documentation.",
    },
    {
        question: "How do you handle samples before bulk orders?",
        answer:
            "We offer both standard and customized sampling options. Standard samples can be delivered within 3-5 working days, while customized samples may take 10-15 days depending on specifications. Sample costs are typically refundable against future bulk orders. We also provide a comprehensive sample kit featuring our bestselling products at a nominal charge.",
    },
    {
        question: "What certifications and compliance standards do your products meet?",
        answer:
            "Our products comply with major international standards including CE, RoHS, REACH, FCC, and UL certifications. For specific markets, we ensure compliance with region-specific regulations such as FDA for the US market and UKCA for the UK. We can provide all necessary certification documentation with each shipment for smooth customs clearance.",
    },
    {
        question: "What are your production and delivery lead times?",
        answer:
            "Our standard production lead time is 20-30 days after order confirmation and deposit receipt. For large volume or customized orders, lead time may extend to 30-45 days. Shipping times vary by destination: 3-5 days for express air freight, 20-30 days for standard sea freight. We provide detailed production schedules with milestone updates throughout the process.",
    },
    {
        question: "Do you offer product warranties and after-sales support?",
        answer:
            "Yes, all our products come with a standard 12-month warranty against manufacturing defects. Our dedicated after-sales team provides technical support via email, phone, and video conference. For B2B clients, we offer extended warranty options and service level agreements with priority support response times and replacement part inventories.",
    },
    {
        question: "Can you provide references or case studies from existing clients?",
        answer:
            "We maintain strong relationships with clients across 40+ countries and can provide references upon request with client permission. Our website features detailed case studies showcasing successful collaborations with international retailers and distributors. We also regularly exhibit at major trade shows including Canton Fair, CES, and Ambiente where you can see our products firsthand.",
    },
]


export default function FaqList({faqData}) {
    return (
        <div className="mx-auto max-w-7xl px-6 py-10 sm:py-20 lg:px-8 lg:py-30">
            <div className="mx-auto max-w-4xl">
                <h2 className="text-3xl text-center leading-normal font-semibold tracking-tight text-gray-900 sm:text-5xl">
                    {lang.FrequentlyAskedQuestions}
                </h2>
                <dl className="mt-12 sm:mt-28 divide-y divide-gray-900/10">
                    {faqData.map((faq) => (
                        <Disclosure key={faq.question} as="div" className="py-6 first:pt-0 last:pb-0">
                            <dt>
                                <DisclosureButton className="group bg-transparent flex w-full items-start justify-between text-left text-gray-900">
                                    <span className="text-base/7 font-semibold">{faq.question}</span>
                                    <span className="ml-6 flex h-7 items-center">
                      <PlusSmallIcon aria-hidden="true" className="size-6 group-data-[open]:hidden" />
                      <MinusSmallIcon aria-hidden="true" className="size-6 group-[&:not([data-open])]:hidden" />
                    </span>
                                </DisclosureButton>
                            </dt>
                            <DisclosurePanel as="dd" className="mt-2 pr-12">
                                <p className="text-base/7 text-gray-600">{faq.reply}</p>
                            </DisclosurePanel>
                        </Disclosure>
                    ))}
                </dl>
            </div>
        </div>
    )
}