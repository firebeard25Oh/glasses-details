# Specs

A mobile-first guided photo tool for estimating non-prescription glasses fit measurements:

- Binocular pupillary distance (PD)
- Nasal bridge width reference
- Frame-specific optical center (OC) height

The browser launches the phone camera or photo picker, uses a standard 85.6 mm bank card for scale, and guides the user through placing measurement landmarks. Photos are processed locally and are not uploaded.

## Run locally

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm run build
```

This prototype provides estimates only. An optician should verify measurements before eyewear is ordered, especially for multifocals, prism, high prescriptions, and safety eyewear.