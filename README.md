# Fleet Management System

A fleet management application for managing vehicles and trips, monitoring vehicle locations, and supporting drivers through a mobile app. The project includes a Django API, a Next.js web interface, and an Expo mobile application.

## Project Structure

- `backend/` - Django REST Framework API and WebSocket services.
- `frontend/` - Next.js and React web dashboard.
- `mobile/` - React Native and Expo driver application.

## Requirements

- Python 3.12 recommended.
- Node.js 20 or later and npm.
- Git.

The repository includes `backend/requirements.txt` and npm lockfiles to reproduce dependency installations. Local databases, virtual environments, dependency folders, build output, and project-specific documentation are excluded from Git.

## Backend Setup (Windows PowerShell)

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
$env:DJANGO_SECRET_KEY = "replace-with-a-private-local-key"
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

The development database uses SQLite. Its local database file is ignored by Git and can be recreated by running migrations.

## Web Frontend

Open another terminal:

```powershell
cd frontend
npm ci
npm run dev
```

The web app is served at `http://localhost:3000`. Its API base URL currently points to `localhost:8000` in `frontend/src/services/api.ts`.

## Mobile App

```powershell
cd mobile
npm ci
npx expo start
```

To connect a physical phone, set the backend IP address for your local network in `mobile/src/services/api.ts`, add the machine's address to `DJANGO_ALLOWED_HOSTS`, and allow network access to port `8000`.

## Deployment Notes

Django reads deployment settings from environment variables. Before deployment, set a unique `DJANGO_SECRET_KEY`, set `DJANGO_DEBUG=False`, and configure `DJANGO_ALLOWED_HOSTS` as a comma-separated list of allowed hostnames. The default secret key is for local development only.

Do not commit `.env` files, credentials, or production databases. Configure CORS, the database, and the application server for your hosting environment before exposing the service publicly.

## License

This project is licensed under the [MIT License](LICENSE).