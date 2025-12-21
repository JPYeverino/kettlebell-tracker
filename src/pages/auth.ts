import { supabase } from '../lib/supabase';

export function renderAuth(container: HTMLElement) {
  let isSignUp = false;

  function render() {
    container.innerHTML = `
      <div class="auth-container">
        <div class="auth-card">
          <h1>Kettlebell Tracker</h1>
          <p class="auth-subtitle">${isSignUp ? 'Create your account' : 'Sign in to continue'}</p>

          <form id="auth-form" class="auth-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input id="email" type="email" required autocomplete="email" />
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input id="password" type="password" required minlength="6" autocomplete="${isSignUp ? 'new-password' : 'current-password'}" />
            </div>

            <div id="error-message" class="error-message" style="display: none;"></div>

            <button type="submit" id="submit-btn" class="btn-primary">
              ${isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <button id="toggle-mode" class="btn-text">
            ${isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    `;

    const form = document.getElementById('auth-form') as HTMLFormElement;
    const toggleBtn = document.getElementById('toggle-mode')!;
    const errorDiv = document.getElementById('error-message')!;
    const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorDiv.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Loading...';

      const email = (document.getElementById('email') as HTMLInputElement).value;
      const password = (document.getElementById('password') as HTMLInputElement).value;

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
          errorDiv.textContent = error.message;
          errorDiv.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign Up';
        } else if (data.user && !data.session) {
          // Email confirmation required
          errorDiv.style.background = '#1a2e1a';
          errorDiv.style.borderColor = '#2e5e2e';
          errorDiv.style.color = '#88ff88';
          errorDiv.textContent = 'Check your email to confirm your account, then sign in.';
          errorDiv.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign Up';
        }
        // If session exists, auth state change will handle navigation
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          errorDiv.textContent = error.message;
          errorDiv.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign In';
        }
      }
    });

    toggleBtn.addEventListener('click', () => {
      isSignUp = !isSignUp;
      render();
    });
  }

  render();
}
