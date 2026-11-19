import { useState, type SubmitEvent } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { Button } from "../../../components/ui/Button/Button";
import { Input } from "../../../components/ui/Input/Input";
import { AuthLayout } from "../components/AuthLayout";

import "./LoginPage.css";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    setEmailError("");
    setPasswordError("");
    setLoginError("");

    let hasError = false;

    if (!email.trim()) {
      setEmailError("Ingresa tu correo electrónico.");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Ingresa tu contraseña.");
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);

    try {
      // AuthContext debe autenticar contra NestJS
      // y lanzar un error si las credenciales son inválidas.
      await login(email.trim(), password);

      setPassword("");

      navigate("/app/dashboard", {
        replace: true,
      });
    } catch (error) {
      setLoginError(
        error instanceof Error
          ? error.message
          : "No fue posible iniciar sesión.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="login">
        <header className="login-header">
          <span className="login-context">Acceso a la plataforma</span>

          <h2>Bienvenido</h2>

          <p>
            Ingresa tus credenciales para continuar a tu espacio de gobierno.
          </p>
        </header>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <Input
            id="email"
            label="Correo electrónico"
            type="email"
            placeholder="nombre@empresa.com"
            autoComplete="email"
            value={email}
            error={emailError}
            onChange={(event) => {
              setEmail(event.target.value);

              if (emailError) {
                setEmailError("");
              }
            }}
          />

          <Input
            id="password"
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            placeholder="Ingresa tu contraseña"
            autoComplete="current-password"
            value={password}
            error={passwordError}
            onChange={(event) => {
              setPassword(event.target.value);

              if (passwordError) {
                setPasswordError("");
              }
            }}
            endIcon={
              <button
                type="button"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          <div className="login-options">
            <label className="login-checkbox">
              <input type="checkbox" />

              <span>Recordarme</span>
            </label>

            <button className="login-link" type="button">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          {loginError && (
            <p className="login-error" role="alert">
              {loginError}
            </p>
          )}
          <Button
            type="submit"
            className="login-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
            <ArrowRight size={17} />
          </Button>
        </form>

        <footer className="login-footer">
          <span className="login-security-dot" />
          Acceso protegido mediante autenticación segura
        </footer>
      </div>
    </AuthLayout>
  );
}
