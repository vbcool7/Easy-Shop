
export const allFaqs = [
    // --- Orders & Shipping ---
    {
        category: "Orders & Shipping",
        question: "How can I track my order status?",
        answer: (
            <div>
                <p>Once your order is shipped, you will receive a tracking link via SMS and email. You can also track it directly from the 'My Orders' section in your account.</p>
            </div>
        )
    },
    {
        category: "Orders & Shipping",
        question: "What are the delivery charges and timelines?",
        answer: (
            <div>
                <p>We offer free shipping on orders above ₹999. Usually, orders are delivered within 3-5 business days for metros and 5-7 days for other regions.</p>
            </div>
        )
    },
    {
        category: "Orders & Shipping",
        question: "Do you offer Express Delivery for urgent orders?",
        answer: (
            <div>
                <p>Yes! We have an **Express Shipping** option available for select pincodes at checkout. Express orders are usually delivered within 24-48 hours.</p>
            </div>
        )
    },
    {
        category: "Orders & Shipping",
        question: "What should I do if my package is marked as delivered but I haven't received it?",
        answer: (
            <div>
                <p>Don't worry! Sometimes courier partners mark it delivered 24 hours in advance. If you still don't receive it, please contact us within 48 hours so we can raise a dispute with the courier company.</p>
            </div>
        )
    },
    {
        category: "Orders & Shipping",
        question: "Can I ship different items in one order to multiple addresses?",
        answer: (
            <div>
                <p>Currently, we only support one delivery address per order. If you want to send items to different locations, please place separate orders for each address.</p>
            </div>
        )
    },
    {
        category: "Orders & Shipping",
        question: "Do I need to be present personally to receive my order?",
        answer: (
            <div>
                <p>Not necessarily. Anyone at the delivery address (family member, neighbor, or security guard) can collect the package on your behalf. For COD orders, please ensure the amount is ready at the time of delivery.</p>
            </div>
        )
    },

    // --- Returns & Refunds ---
    {
        category: "Returns & Refunds",
        question: "What is your return policy?",
        answer: (
            <div>
                <p>We have a 7-day easy return policy. Items must be unused, unwashed, and have all original tags attached. Some items like innerwear are non-returnable for hygiene reasons.</p>
            </div>
        )
    },
    {
        category: "Returns & Refunds",
        question: "How long does it take to get a refund?",
        answer: (
            <div>
                <p>Once we receive the product and it passes the quality check, the refund is initiated within 48 hours. It may take 5-7 bank working days to reflect in your account.</p>
            </div>
        )
    },
    {
        category: "Returns & Refunds",
        question: "How do I create a return request?",
        answer: (
            <div>
                <p>You can raise a return request within 7 days of delivery. Go to <b>My Orders</b>, select the product, and click on <b>Return/Exchange</b>. Our courier partner will pick it up within 48 hours.</p>
            </div>
        )
    },
    {
        category: "Returns & Refunds",
        question: "Can I exchange an item for a different size?",
        answer: (
            <div>
                <p>Yes! If the size doesn't fit, you can opt for an <b>Exchange</b>. We will deliver the new size and pick up the old one simultaneously, subject to stock availability.</p>
            </div>
        )
    },
    {
        category: "Returns & Refunds",
        question: "Are there any items that cannot be returned?",
        answer: (
            <div>
                <p>For hygiene reasons, items like <b>innerwear, socks, swimwear, and beauty products</b> cannot be returned. Also, items bought during 'Final Clearance' sales are non-returnable.</p>
            </div>
        )
    },
    {
        category: "Returns & Refunds",
        question: "What is the 'Quality Check' process for returns?",
        answer: (
            <div>
                <p>Once the item reaches our warehouse, it undergoes a quality check. The item must be <b>unwashed, unused,</b> and have all <b>original tags</b> intact. If it fails the check, it will be sent back to you.</p>
            </div>
        )
    },
    {
        category: "Returns & Refunds",
        question: "I paid via COD. How will I get my refund?",
        answer: (
            <div>
                <p>For COD orders, you can choose to receive the refund in your <b>Easy Shop Wallet</b> (instant) or provide your <b>Bank Account details</b> (UPI/NEFT) during the return process. Bank transfers take 5-7 business days.</p>
            </div>
        )
    },

    // --- Size & Quality ---
    {
        category: "Size & Quality",
        question: "How do I find the right size for me?",
        answer: (
            <div>
                <p>Every product page has a detailed 'Size Guide'. We recommend measuring yourself and comparing it with our chart as sizes can vary between different fits (e.g., Slim Fit vs Oversized).</p>
            </div>
        )
    },
    {
        category: "Size & Quality",
        question: "How do I know which size will fit me best?",
        answer: (
            <div>
                <p>Every product page has a <b>Size Chart</b> button. We provide measurements in both inches and centimeters. We recommend measuring a similar garment you already own and comparing it with our chart.</p>
            </div>
        )
    },
    {
        category: "Size & Quality",
        question: "Do you have 'Plus Size' options available?",
        answer: (
            <div>
                <p>Yes! We have a dedicated <b>Curve & Plus</b> collection that goes up to 5XL. You can use the 'Size' filter on the shop page to see available options in your size.</p>
            </div>
        )
    },
    {
        category: "Size & Quality",
        question: "Will the fabric shrink after the first wash?",
        answer: (
            <div>
                <p>Most of our cotton garments are <b>pre-shrunk</b>. However, to maintain the fit, we suggest washing in cold water and avoiding high-heat dryers for natural fabrics.</p>
            </div>
        )
    },

    // --- Payments & Offers ---
    {
        category: "Payments & Offers",
        question: "What payment methods do you accept?",
        answer: (
            <div>
                <p>We accept all major Credit/Debit cards, UPI (Google Pay, PhonePe), Net Banking, and Cash on Delivery (COD) for most pincodes.</p>
            </div>
        )
    },
    {
        category: "Payments & Offers",
        question: "How do I apply a coupon code?",
        answer: (
            <div>
                <p>You can enter your promo code at the 'Checkout' page under the 'Apply Coupon' section before making the final payment.</p>
            </div>
        )
    },
    {
        category: "Payments & Offers",
        question: "Is it safe to use my credit/debit card on Easy Shop?",
        answer: (
            <div>
                <p>Absolutely! We use <b>SSL encryption</b> and <b>PCI-DSS compliant</b> payment gateways (like Razorpay/Cashfree) to ensure your transaction details are 100% secure.</p>
            </div>
        )
    },
    {
        category: "Payments & Offers",
        question: "My payment failed, but the money was deducted. What should I do?",
        answer: (
            <div>
                <p>Don't panic! This usually happens due to a bank server lag. If the order isn't confirmed, the money is automatically <b>refunded by your bank within 3-5 business days</b>. You can also contact our support with the transaction ID.</p>
            </div>
        )
    },
    {
        category: "Payments & Offers",
        question: "Can I use multiple coupon codes on a single order?",
        answer: (
            <div>
                <p>Currently, our system allows only <b>one coupon code</b> per order. However, you can use a coupon code along with any existing 'Easy Shop Wallet' balance.</p>
            </div>
        )
    },

    // --- Cancellations & Modifications ---
    {
        category: "Cancellations & Modifications",
        question: "Can I cancel my order after it has been placed?",
        answer: (
            <div>
                <p>Yes, you can cancel your order within 24 hours of placing it, or until it has been shipped. Once shipped, the order cannot be cancelled but can be returned.</p>
            </div>
        )
    },
    {
        category: "Cancellations & Modifications",
        question: "Can I add more items to an order I just placed?",
        answer: (
            <div>
                <p>Once an order is placed, we cannot add items to it. We suggest you <b>place a new order</b> for the additional items. If you want everything together, you can cancel the current order and re-order everything.</p>
            </div>
        )
    },
    {
        category: "Cancellations & Modifications",
        question: "How do I change the size or color of an item in my order?",
        answer: (
            <div>
                <p>Modifications are only possible if the order hasn't been processed. Please <b>call our support team</b> or use the <b>Live Chat</b> within 1 hour of placing the order to check if changes can be made.</p>
            </div>
        )
    },

    // --- Sign Up & Login ---
    {
        category: "Sign Up & Login",
        question: "I forgot my password. How do I reset it?",
        answer: (
            <div>
                <p>Go to the Login page, click on 'Forgot Password', and enter your registered email/phone number. We will send you an OTP or a reset link instantly.</p>
            </div>
        )
    },
    {
        category: "Sign Up & Login",
        question: "Do I need to create an account to place an order?",
        answer: (
            <div>
                <p>You can checkout as a <b>Guest</b>, but we highly recommend creating an account. It helps you track orders easily, save multiple addresses, and earn <b>Easy Points</b> on every purchase.</p>
            </div>
        )
    },
    {
        category: "Sign Up & Login",
        question: "I am not receiving the OTP for login. What's wrong?",
        answer: (
            <div>
                <p>Please ensure you have entered the correct mobile number. Sometimes network issues delay the SMS. You can also try the <b>'Login via Email'</b> option or wait for 60 seconds to 'Resend OTP'.</p>
            </div>
        )
    },
    {
        category: "Sign Up & Login",
        question: "How can I delete my Easy Shop account and data?",
        answer: (
            <div>
                <p>We're sorry to see you go! You can request account deletion under <b>Profile Settings - Privacy</b>. Please note that once deleted, your order history and rewards will be permanently lost.</p>
            </div>
        )
    }
];