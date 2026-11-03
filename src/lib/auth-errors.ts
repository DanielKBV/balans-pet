import type { AuthError } from "@supabase/supabase-js"

const messages: Record<string, string> = {
  invalid_credentials: "Неверная почта или пароль",
  user_already_exists: "Аккаунт с этой почтой уже есть. Войдите",
  email_exists: "Аккаунт с этой почтой уже есть. Войдите",
  weak_password: "Пароль слишком простой. Нужно не меньше 6 символов",
  same_password: "Новый пароль совпадает со старым",
  email_not_confirmed: "Почта не подтверждена. Проверьте письмо от Balans",
  over_email_send_rate_limit: "Слишком много писем. Попробуйте через час",
  over_request_rate_limit: "Слишком много попыток. Подождите минуту",
  validation_failed: "Проверьте почту и пароль",
  session_not_found: "Ссылка устарела. Запросите новую",
}

/** Russian message for a Supabase Auth error. */
export function authErrorMessage(error: AuthError) {
  return (error.code && messages[error.code]) || "Что-то пошло не так. Попробуйте ещё раз"
}
