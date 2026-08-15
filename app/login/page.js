async function sendPhoneOtp() {
    // Dev mode: koi real OTP nahi bhejna, seedha next step
    setMode("phone-otp");
    setTimer(30);
}

async function verifyPhoneOtp() {
    const code = otp.join("");
    if (code.length < 6) { setOtpError("Enter all 6 digits."); return; }
    setLoading(true);
    try {
        const fullPhone = phone.startsWith("+") ? phone : `+91${phone}`;
        const res = await nextAuthSignIn("dev-phone", {
            phone: fullPhone,
            otp: code,
            redirect: false,
        });

        if (res?.ok) {
            router.push("/dashboard");
        } else {
            setOtpError("Incorrect code. Try 123456.");
        }
    } catch (err) {
        console.error(err);
        setOtpError("Something went wrong.");
    } finally {
        setLoading(false);
    }
}