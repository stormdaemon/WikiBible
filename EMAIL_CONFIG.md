# Configuration du Template Email de Confirmation

## Problème Actuel

Le lien dans l'email utilise le format par défaut de Supabase qui redirige vers `/auth/verify?token=...`, ce qui ne fonctionne pas avec notre Next.js App Router.

## Solution

Vous devez modifier le template d'email dans le dashboard Supabase pour utiliser `token_hash` au lieu de `token` et pointer vers notre route `/auth/callback`.

### Étapes :

1. **Allez sur le Dashboard Supabase** : https://supabase.com/dashboard/project/gsqodedelzzbcqefoneb/auth/templates

2. **Sélectionnez "Confirm signup"**

3. **Remplacez le template par** :

```html
<h2>Confirmez votre inscription</h2>
<p>Bienvenue sur WikiBible ! Cliquez sur le lien ci-dessous pour confirmer votre email :</p>
<p>
  <a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email">
    Confirmer mon email
  </a>
</p>
<p><small>Si vous n'avez pas créé de compte sur WikiBible, vous pouvez ignorer cet email.</small></p>
```

4. **Sauvegardez les modifications**

5. **Testez** en créant un nouveau compte

## Pourquoi cette modification ?

- `token_hash` est sécurisé pour les URL (hash au lieu du token brut)
- `type=email` indique que c'est une confirmation d'inscription
- Notre route `/auth/callback` gère maintenant ce format correctement

## Variables Disponibles

- `{{ .SiteURL }}` = Votre URL de site (https://wikibibledev.netlify.app)
- `{{ .TokenHash }}` = Le token hash sécurisé
- `{{ .Email }}` = L'email de l'utilisateur
- `{{ .ConfirmationURL }}` = L'URL par défaut (ne pas utiliser)
