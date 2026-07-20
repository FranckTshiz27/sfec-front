<#import "template.ftl" as layout>
<@layout.registrationLayout; section>
    <#if section = "title">
        ${msg("loginTitle",(realm.displayName!''))}
    <#elseif section = "header">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <link href="${url.resourcesPath}/img/log.png" rel="icon"/>
        <link href="${url.resourcesPath}/css/login.css?v=20260703" rel="stylesheet"/>
        <style>
            html, body {
                margin: 0;
                width: 100%;
                height: 100%;
                font-family: Inter, Arial, sans-serif;
                background: #f4f7fd;
                color: #10214a;
            }
            * { box-sizing: border-box; }
            .auth-shell {
                width: min(1200px, calc(100% - 24px));
                min-height: min(760px, calc(100vh - 24px));
                margin: 12px auto;
                display: flex;
                border-radius: 14px;
                overflow: hidden;
                background: #fff;
                border: 1px solid #e6eaf2;
                box-shadow: 0 16px 40px rgba(15, 35, 74, 0.12);
            }
            .auth-left-panel {
                width: 45%;
                padding: 52px 46px;
                display: flex;
                flex-direction: column;
                gap: 42px;
                background:
                    linear-gradient(180deg, rgba(14, 51, 132, 0.82), rgba(11, 40, 109, 0.9)),
                    url("${url.resourcesPath}/img/shutterstock_655882915-compressor.jpg") center/cover no-repeat;
                color: #fff;
            }
            .left-logo { width: 220px; max-width: 100%; }
            .left-welcome-block h2 { margin: 0; font-size: 42px; font-weight: 700; }
            .accent-line {
                display: block; width: 54px; height: 6px; border-radius: 999px;
                background: #2f8cff; margin: 18px 0;
            }
            .left-welcome-block p {
                margin: 0; max-width: 320px; font-size: 29px; line-height: 1.45;
                color: rgba(255, 255, 255, 0.92);
            }
            .left-feature-list { display: grid; gap: 18px; }
            .feature-item { display: flex; align-items: flex-start; gap: 12px; }
            .feature-icon {
                width: 36px; height: 36px; border-radius: 10px; background: rgba(47, 140, 255, 0.22);
                display: inline-flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700;
            }
            .feature-item strong { display: block; font-size: 26px; font-weight: 600; }
            .feature-item p { margin: 6px 0 0; font-size: 24px; line-height: 1.35; color: rgba(255, 255, 255, 0.88); }
            .auth-right-panel { width: 55%; padding: 30px 48px 26px; display: flex; flex-direction: column; }
            .top-controls { display: flex; justify-content: flex-end; }
            .locale-wrap {
                display: inline-flex; align-items: center; gap: 8px; border: 1px solid #d9e2ef;
                border-radius: 10px; padding: 4px 10px; min-height: 42px;
            }
            .locale-select { border: none; outline: none; background: transparent; color: #25395f; font-size: 15px; font-weight: 500; }
            .auth-right-panel h1 { margin: 72px 0 0; text-align: center; font-size: 56px; line-height: 1.2; color: #112455; }
            .lock-divider {
                margin: 24px auto 0; width: 380px; max-width: 100%;
                display: flex; align-items: center; gap: 14px;
            }
            .lock-divider::before, .lock-divider::after { content: ""; height: 1px; background: #dce3ef; flex: 1; }
            .lock-divider span {
                width: 28px; height: 28px; border-radius: 50%; border: 1px solid #dce3ef;
                display: inline-flex; align-items: center; justify-content: center; color: #8ba0be; font-weight: 700;
            }
            .auth-subtitle { margin: 20px 0 0; text-align: center; font-size: 30px; color: #637896; }
            .auth-form { width: min(520px, 100%); margin: 24px auto 0; }
            .field-wrap { position: relative; margin-bottom: 14px; }
            .field-icon {
                position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
                color: #8ea0ba; font-size: 15px; font-style: normal; font-weight: 600;
            }
            .login-field {
                width: 100%; height: 58px; border: 1px solid #d5deeb; border-radius: 12px;
                padding: 0 48px; font-size: 16px; color: #1f3358; background: #fff; outline: none;
            }
            .login-field:focus { border-color: #2a67bf; box-shadow: 0 0 0 3px rgba(42, 103, 191, 0.12); }
            .visibility { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; cursor: pointer; }
            .visibility img { width: 20px; height: 20px; }
            .remember-row { display: flex; align-items: center; justify-content: space-between; margin: 6px 0 16px; }
            .remember-me { display: inline-flex; align-items: center; gap: 8px; color: #556b88; font-size: 15px; }
            .remember-me input { width: 16px; height: 16px; accent-color: #2a67bf; }
            .forgot-link { color: #1f5dd5; font-size: 15px; text-decoration: none; font-weight: 600; }
            .submit-btn {
                width: 100%; height: 56px; border: none; border-radius: 12px; color: #fff;
                background: linear-gradient(135deg, #133f99, #0f2f7e); font-size: 18px; font-weight: 700; cursor: pointer;
            }
            .auth-footer { margin-top: auto; border-top: 1px solid #e7edf6; padding-top: 18px; }
            .auth-footer p { margin: 0; text-align: center; color: #7a8da7; font-size: 13px; }
            @media (max-width: 860px) {
                .auth-shell { flex-direction: column; min-height: auto; }
                .auth-left-panel, .auth-right-panel { width: 100%; }
                .auth-right-panel h1 { font-size: 34px; margin-top: 18px; }
                .auth-subtitle { font-size: 20px; }
                .left-welcome-block p { font-size: 18px; max-width: 100%; }
                .feature-item strong { font-size: 20px; }
                .feature-item p { font-size: 16px; }
            }
        </style>
        <script>
            function togglePassword() {
                var x = document.getElementById("password");
                var v = document.getElementById("vi");
                if (x.type === "password") {
                    x.type = "text";
                    v.src = "${url.resourcesPath}/img/eye.png";
                } else {
                    x.type = "password";
                    v.src = "${url.resourcesPath}/img/eye-off.png";
                }
            }
        </script>
    <#elseif section = "form">
        <div class="auth-shell">
            <div class="auth-left-panel">
                <img class="left-logo" src="${url.resourcesPath}/img/logo_rawsur.svg" alt="Rawsur"/>

                <div class="left-welcome-block">
                    <h2>Bienvenue</h2>
                    <span class="accent-line"></span>
                    <p>Connectez-vous pour acceder a votre espace securise</p>
                </div>

                <div class="left-feature-list">
                    <div class="feature-item">
                        <span class="feature-icon">S</span>
                        <div>
                            <strong>Securise</strong>
                            <p>Vos donnees sont protegees</p>
                        </div>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">+</span>
                        <div>
                            <strong>Simple</strong>
                            <p>Acces rapide a vos services</p>
                        </div>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">?</span>
                        <div>
                            <strong>Support</strong>
                            <p>Une equipe a votre ecoute</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="auth-right-panel">
                <div class="top-controls">
                    <#if realm.internationalizationEnabled  && locale.supported?size gt 1>
                        <div class="locale-wrap">
                            <i class="locale-icon">O</i>
                            <select class="locale-select" onchange="if (this.value) window.location.href=this.value">
                                <#list locale.supported as l>
                                    <option value="${l.url}" ${(l.languageTag == locale.currentLanguageTag)?then('selected','')}>${l.label}</option>
                                </#list>
                            </select>
                        </div>
                    </#if>
                </div>

                <h1>Facture normalisee</h1>
                <div class="lock-divider">
                    <span>*</span>
                </div>
                <p class="auth-subtitle">Veuillez vous connecter pour continuer</p>

                <#if realm.password>
                    <#if message?has_content>
                        <div class="message-box ${message.type}">
                            ${message.summary?no_esc}
                        </div>
                    </#if>
                    <form id="kc-form-login" class="auth-form" onsubmit="return true;" action="${url.loginAction}" method="post">
                        <div class="field-wrap">
                            <span class="field-icon">@</span>
                            <input
                                id="username"
                                class="login-field"
                                placeholder="${msg("username")}"
                                type="text"
                                name="username"
                                value="${(login.username!'')}"
                                tabindex="1"
                                autofocus
                            />
                        </div>

                        <div class="field-wrap">
                            <span class="field-icon">*</span>
                            <input
                                id="password"
                                class="login-field"
                                placeholder="${msg("password")}"
                                type="password"
                                name="password"
                                tabindex="2"
                            />
                            <label class="visibility" id="v" onclick="togglePassword()">
                                <img id="vi" src="${url.resourcesPath}/img/eye-off.png" alt="toggle"/>
                            </label>
                        </div>

                        <div class="remember-row">
                            <#if realm.rememberMe>
                                <label class="remember-me">
                                    <input id="rememberMe" name="rememberMe" type="checkbox" tabindex="3" <#if login.rememberMe??>checked</#if> />
                                    <span>${msg("rememberMe")}</span>
                                </label>
                            </#if>

                            <#if realm.resetPasswordAllowed>
                                <a class="forgot-link" href="${url.loginResetCredentialsUrl}">${msg("doForgotPassword")}</a>
                            </#if>
                        </div>

                        <#if auth?has_content && auth.showUsername() && auth.showTryAnotherWayLink()>
                            <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                        </#if>

                        <button class="submit-btn" type="submit" tabindex="4">${msg("doLogIn")}</button>
                    </form>
                </#if>

                <div class="auth-footer">
                    <p>&copy; ${msg("copyright", "${.now?string('yyyy')}")}</p>
                </div>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>
