export default function Footer() {
  return (
    <footer className="mt-10 border-t bg-white">

      <div className="px-8 py-5 flex flex-col md:flex-row justify-between items-center">

        <div>

          <h3 className="font-bold text-blue-700 text-lg">
            Nepal Electronics & IT Solution
          </h3>

          <p className="text-gray-500 text-sm">
            NEITS Repair Management System
          </p>

        </div>

        <div className="text-center mt-4 md:mt-0">

          <p className="text-gray-500 text-sm">
            Version 1.0
          </p>

          <p className="text-gray-400 text-xs">
            Built with React • Node.js • Prisma
          </p>

        </div>

        <div className="text-right mt-4 md:mt-0">

          <p className="text-gray-500 text-sm">
            © 2026 Nepal Electronics & IT Solution
          </p>

          <p className="text-gray-400 text-xs">
            All Rights Reserved
          </p>

        </div>

      </div>

    </footer>
  );
}

