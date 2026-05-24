# Deploy Guide

## 1. Local check

Run these commands in the project root:

```bash
npm install
npm run build
```

If `npm run build` passes, the app is ready to deploy.

## 2. Push to GitHub

This repository already has a GitHub remote:

```bash
git remote -v
```

Push your latest code:

```bash
git add .
git commit -m "Prepare production deploy"
git push origin main
```

## 3. Deploy on Vercel

For a first deployment, the easiest path is the Vercel dashboard:

1. Sign in to Vercel with GitHub.
2. Click `Add New...` -> `Project`.
3. Import `Fatemerjn/local-notion`.
4. Vercel should detect it as a Vite app automatically.
5. Keep the default build settings unless you changed them manually:
   - Build command: `npm run build`
   - Output directory: `dist`
6. Click `Deploy`.

After deploy, Vercel gives you a temporary `*.vercel.app` domain.

## 4. Add your real domain

After the project is live:

1. Open the project in Vercel.
2. Go to `Settings` -> `Domains`.
3. Add your domain, for example `yourdomain.com`.
4. If the domain is managed outside Vercel, update the DNS records that Vercel shows you.

Typical DNS setup:

- Root domain (`yourdomain.com`): `A` record to `76.76.21.21`
- `www.yourdomain.com`: `CNAME` to the Vercel target shown in the dashboard

When DNS is verified, Vercel will attach the domain automatically.

## 5. Future updates

After the first setup, every new push to GitHub can redeploy the app automatically.

Recommended flow:

```bash
git add .
git commit -m "Your change"
git push origin main
```

## Notes

- This app is a static frontend built with Vite, so Vercel is a good fit.
- Browser storage is local to each device. If you want notes to sync between users/devices later, you will need a backend and database.
