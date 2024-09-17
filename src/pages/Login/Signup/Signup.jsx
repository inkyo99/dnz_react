import React, { useState, useRef } from 'react';
import { api } from '../../../config/config';
import styles from './Signup.module.css';

const Signup = ({ toggleSignup }) => {
    const [signup, setSignup] = useState({
        userId: '',
        userPw: '',
        userPwConfirm: '',
        userName: '',
        userBirthDate: '',  
        userPhoneNumber: '',
        userEmail: ''
    });
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerificationRequestSent, setIsVerificationRequestSent] = useState(false);

    const userIdRef = useRef(null);
    const userEmailRef = useRef(null);
    const userPhoneRef = useRef(null);
    const userNameRef = useRef(null);
    const userPwConfirmRef = useRef(null);


    const handleSignupChange = (e) => {
        const { name, value } = e.target;
        setSignup((prev) => {
            const updatedSignup = { ...prev, [name]: value };
            // userBirthDateFront와 userBirthDateBack을 합쳐서 userBirthDate를 업데이트
            if (name === 'userBirthDateFront' || name === 'userBirthDateBack') {
                updatedSignup.userBirthDate = `${updatedSignup.userBirthDateFront}${updatedSignup.userBirthDateBack}`;
            }
            return updatedSignup;
        });

       
    };

    const validateSignupInputs = () => {
        const idRegex = /^[a-zA-Z0-9]{6,20}$/;
        const nameRegex = /^[a-zA-Z0-9가-힣]{2,15}$/;
        const phoneRegex = /^\d{10,11}$/;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2}$/;
        const pwRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;

        const emailAddressArr = ['naver.com', 'gmail.com'];

        if (!idRegex.test(signup.userId)) {
            alert("아이디는 6자 이상 20자 이하의 알파벳과 숫자로만 구성되어야 합니다.");
            return false;
        }

        if (!nameRegex.test(signup.userName)) {
            alert("닉네임은 2자 이상 15자로 구성되어야 합니다.");
            return false;
        }

        if (!phoneRegex.test(signup.userPhoneNumber)) {
            alert("핸드폰 번호는 숫자 10자리 또는 11자리로 입력해 주세요.");
            return false;
        }

        // if (!emailRegex.test(signup.userEmail)) {
        //     alert("유효한 이메일 주소를 입력해 주세요.");
        //     return false;
        // }

        if (!pwRegex.test(signup.userPw)) {
            alert("비밀번호는 대소문자, 숫자, 특수문자를 포함하여 8~12자리로 입력해 주세요.");
            return false;
        }

        if (signup.userPw !== signup.userPwConfirm) {
            alert("비밀번호가 일치하지 않습니다.");
            return false;
        }

        if(signup.userEmail.indexOf("@") != -1) {
            const emailAddress = signup.userEmail.substring(signup.userEmail.indexOf("@") + 1, signup.userEmail.length);
            if(emailAddressArr.filter((x) => x === emailAddress).length == 0) {
                alert("유효한 이메일 형식이 아닙니다.");
                return false;
            }
        }
        else {
            alert("유효한 이메일 형식이 아닙니다.");
            return false;
        }




        return true;
    };

    const requestEmailVerification = () => {
        if (!validateSignupInputs()) {
            return;
        }

        if (!signup.userEmail) {
            alert("이메일을 입력해 주세요");
            return;
        }

        api.post(`/auth/requestEmailVerification/` + signup.userEmail)
            .then(resp => {
                alert('이메일이 전송되었습니다. 이메일을 확인해주세요.');
                setIsVerificationRequestSent(true);
            })
            .catch((error) => {
                alert("이메일 전송 실패, 다시 시도하여 주세요");
            });
    };

    const verifyCode = () => {
        if (!verificationCode) {
            alert("인증 코드를 입력해 주세요.");
            return;
        }

        api.post(`/auth/verifyEmail`, { userEmail: signup.userEmail, verificationCode })
            .then(resp => {
                if (resp.data === "verified") {
                    setIsEmailVerified(true);
                    alert("이메일 인증 완료");
                } else {
                    alert('인증 코드가 올바르지 않습니다.');
                }
            })
            .catch(error => alert("인증 실패"));
    };

    const handleSignup = () => {
        if (!isEmailVerified) {
            alert("이메일 인증이 완료되지 않았습니다.");
            return;
        }

        if (!validateSignupInputs()) {
            return;
        }


        
        api.post(`/auth/registerUser`, signup)
            .then(() => {
                alert("회원가입 완료");
                setSignup({
                    userId: '',
                    userPw: '',
                    userPwConfirm: '',
                    userName: '',
                    userBirthDate: '',
                    userPhoneNumber: '',
                    userEmail: ''
                });
                setIsEmailVerified(false);
                setIsVerificationRequestSent(false);
            })
            .catch(() => alert("회원가입 실패"));
    };

    const checkIdExist = (id) => {
        const idRegex = /^[a-zA-Z0-9]{6,20}$/;

        if (!idRegex.test(signup.userId)) {
            userIdRef.current.style.backgroundColor = "#ffe1ca";
            userIdRef.current.style.borderColor = "#ffeedf";

            return;
        }

        api.post(`/auth/existId`, { userId: id })
            .then(resp => {
                userIdRef.current.style.backgroundColor = "#e7ffef";
                userIdRef.current.style.borderColor = "rgb(124 213 119)";
            })
            .catch(error => {
                userIdRef.current.style.backgroundColor = "#ffe1ca";
                userIdRef.current.style.borderColor = "#ffeedf";
            }
            )
    }

    const checkNameExist = (name) => {
        const nameRegex = /^[a-zA-Z0-9가-힣]{2,15}$/;

        if (!nameRegex.test(signup.userName)) {
            userNameRef.current.style.backgroundColor = "#ffe1ca";
            userNameRef.current.style.borderColor = "#ffeedf";

            return;
        }

        api.post(`/auth/existName`, { userName: name })
            .then(resp => {
                userNameRef.current.style.backgroundColor = "#ffe1ca";
                userNameRef.current.style.borderColor = "#ffeedf";
            })
            .catch(error => {
                userNameRef.current.style.borderColor = "rgb(124 213 119)";
                userNameRef.current.style.backgroundColor = "#e7ffef";
            }
            )
    }

    const checkEmailExist = (email) => {
        const emailAddressArr = ['naver.com', 'gmail.com'];

        const emailAddress = email.substring(email.indexOf("@") + 1, email.length);
        if(emailAddressArr.filter((x) => x === emailAddress).length == 0) {
            userEmailRef.current.style.backgroundColor = "#ffe1ca";
            userEmailRef.current.style.borderColor = "#ffeedf";

            return;
        }


        api.post(`/auth/existEmail`, { userEmail: email })
            .then(resp => {
                userEmailRef.current.style.backgroundColor = "#ffe1ca";
                userEmailRef.current.style.borderColor = "#ffeedf";
            })
            .catch(error => {
                userEmailRef.current.style.backgroundColor = "#e7ffef";
                userEmailRef.current.style.borderColor = "rgb(124 213 119)";
            }
            )
    }

    const checkPhoneExist = (phone) => {
        const phoneRegex = /^01[016789]\d{4}\d{4}$/;

        if (!phoneRegex.test(signup.userPhoneNumber)) {
            userPhoneRef.current.style.backgroundColor = "#ffe1ca";
            userPhoneRef.current.style.borderColor = "#ffeedf";

            return;
        }

        api.post(`/auth/existPhoneNumber`, { userPhoneNumber: phone })
            .then(resp => {
                userPhoneRef.current.style.backgroundColor = "#e7ffef";
                userPhoneRef.current.style.borderColor = "rgb(124 213 119)";
            })
            .catch(error => {
                userPhoneRef.current.style.backgroundColor = "#ffe1ca";
                userPhoneRef.current.style.borderColor = "#ffeedf";
            }
            )
    }

    

    return (
        <div className={styles.signupForm}>
            <div className={styles.signupContainer}>
                <p>ID</p>
                <input
                    type="text"
                    name="userId"
                    value={signup.userId}
                    onChange={handleSignupChange}
                    placeholder="6~20자리 아이디를 입력해 주세요"
                    className={styles.inputField}
                    onKeyUp={(e) => { checkIdExist(e.target.value) }}
                    ref={userIdRef}
                />
                <p>Password</p>
                <input
                    type="password"
                    name="userPw"
                    value={signup.userPw}
                    onChange={handleSignupChange}
                    placeholder="8~12자리 대소문자, 숫자, 특수문자 포함"
                    className={styles.inputField}
                />
                <input
                    type="password"
                    name="userPwConfirm"
                    value={signup.userPwConfirm}
                    onChange={handleSignupChange}
                    placeholder="비밀번호를 한 번 더 입력해 주세요"
                    className={styles.inputField}
                    ref={userPwConfirmRef}
                />
                <p>닉네임</p>
                <input
                    type="text"
                    name="userName"
                    value={signup.userName}
                    onChange={handleSignupChange}
                    placeholder="2~15자리 닉네임을 입력해 주세요"
                    className={styles.inputField}
                    onKeyUp={(e) => { checkNameExist(e.target.value) }}
                    ref={userNameRef}
                />
                <p>주민번호</p>
                <div className={styles.birthDateContainer}>
                    <input
                        type="text"
                        name="userBirthDateFront"
                        value={signup.userBirthDateFront}
                        onChange={handleSignupChange}
                        placeholder="주민번호 앞 6자리를 입력해 주세요"
                        className={styles.inputField}
                    />
                    <select
                        name="userBirthDateBack"
                        value={signup.userBirthDateBack}
                        onChange={handleSignupChange}
                        className={styles.inputField}
                    >
                        <option value="">주민번호 뒷자리 선택</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                    </select>
                </div>
                <p>핸드폰번호</p>
                <input
                    type="text"
                    name="userPhoneNumber"
                    value={signup.userPhoneNumber}
                    onChange={handleSignupChange}
                    placeholder="핸드폰 번호를 입력해 주세요 (숫자 10~11자리)"
                    className={styles.inputField}
                    onKeyUp={(e) => { checkPhoneExist(e.target.value) }}
                    ref={userPhoneRef}
                />
                <p>이메일</p>
                <input
                    type="email"
                    name="userEmail"
                    value={signup.userEmail}
                    onChange={handleSignupChange}
                    placeholder="이메일을 입력해 주세요"
                    className={styles.inputField}
                    onKeyUp={(e) => { checkEmailExist(e.target.value) }}
                    ref={userEmailRef}
                />
                <button
                    onClick={requestEmailVerification}
                    className={`${styles.actionButton} ${isVerificationRequestSent ? styles.active : ''}`}
                >
                    이메일 인증 요청
                </button>
                {isVerificationRequestSent && (
                    <>
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="인증 코드"
                            className={styles.inputField}
                        />
                        <button
                            onClick={verifyCode}
                            className={styles.actionButton}
                        >
                            인증 코드 확인
                        </button>
                    </>
                )}
                {isEmailVerified && (
                    <button
                        onClick={handleSignup}
                        className={styles.actionButton}
                    >
                        회원가입
                    </button>
                )}
                <button
                    onClick={toggleSignup}
                    className={styles.actionButton}
                >
                    뒤로가기
                </button>
            </div>
        </div>
    );
};

export default Signup;
