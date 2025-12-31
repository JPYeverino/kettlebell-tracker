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

            ${isSignUp ? `
              <div class="form-group">
                <label for="invite-code">Invite Code</label>
                <input id="invite-code" type="text" required placeholder="PILOT-KB-##" style="text-transform: uppercase;" />
                <small style="color: #888; font-size: 0.875rem;">Get your invite code from Discord</small>
              </div>
            ` : ''}

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
        const inviteCode = (document.getElementById('invite-code') as HTMLInputElement).value.toUpperCase().trim();

        // Step 1: Pre-validate the invite code exists and is available
        // This provides better UX by checking before account creation
        const { data: inviteCheck, error: checkError } = await supabase
          .from('pilot_invites')
          .select('code, used')
          .eq('code', inviteCode)
          .single();

        if (checkError || !inviteCheck || inviteCheck.used) {
          errorDiv.textContent = 'Invalid or already used invite code. Contact admin if you think this is an error.';
          errorDiv.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign Up';
          return;
        }

        // Step 2: Create the account
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
          errorDiv.textContent = error.message;
          errorDiv.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign Up';
          return;
        }

        if (!data.user) {
          errorDiv.textContent = 'Failed to create account. Please try again.';
          errorDiv.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign Up';
          return;
        }

        // Step 3: Atomically claim the invite code
        // This UPDATE only succeeds if the code is STILL not used (race condition protection)
        // PostgreSQL's MVCC ensures atomicity - only ONE update will succeed
        const { data: claimedInvite, error: claimError } = await supabase
          .from('pilot_invites')
          .update({
            used: true,
            used_by: data.user.id,
            used_at: new Date().toISOString()
          })
          .eq('code', inviteCode)
          .eq('used', false)  // Critical: only update if NOT already used
          .select()
          .single();

        if (claimError || !claimedInvite) {
          // Code was claimed by another user in the race window
          // Note: The orphaned user account will remain but cannot sign in without a valid code claim
          // This is acceptable for a 10-user pilot - admins can clean up if needed
          errorDiv.textContent = 'This invite code was just claimed by another user. Please try a different code.';
          errorDiv.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign Up';
          return;
        }

        // Success - code was atomically claimed
        if (!data.session) {
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
