export function Header({ imageURL }: { imageURL?: string }) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 flex items-center gap-4">
        <img src={imageURL} alt="Logo" className="h-20 w-auto object-contain" />
        <div className="py-4">
          <h1 className="text-2xl font-bold text-gray-900">AgroDrone Control System</h1>
          <p className="text-gray-600">Semi-autonomous agricultural monitoring</p>
        </div>
      </div>
    </header>
  );
}
