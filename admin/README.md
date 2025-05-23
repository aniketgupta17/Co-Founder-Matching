# Cofounder Matching Admin Console
READ_ME written by Gemini 2.5 Pro.

A Next.js sub application with Supabase integration for managing co-founder relationships and agreements. This application is designed to be hosted locally and should not be exposed to the internet due to the absence of user authentication.

## Prerequisites

- Node.js (v18 or higher)
- npm
- The Supabase login details

## Getting Started

cd admin

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ADMIN_KEY=your-admin-key
```

You can find these values in your Supabase project dashboard under Project Settings > API.

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
cofounder2/
├── lib/
│   └── supabaseClient.ts    # Supabase client configuration
├── public/                  # Static assets
├── src/
│   ├── app/                # Next.js app directory
│   └── components/         # React components
└── package.json
```

## Environment Variables

The following environment variables are required:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ADMIN_KEY`: Your Supabase admin key

## Development

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
