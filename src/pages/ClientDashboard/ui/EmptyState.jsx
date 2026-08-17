const EmptyState = ({ icon: Icon = Package, title, description }) => {
  return (
    <div className="min-h-[220px] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mb-4">
        <Icon size={30} />
      </div>

      <h3 className="font-black text-slate-600">{title}</h3>

      {description && (
        <p className="text-sm text-slate-400 mt-1 max-w-sm">{description}</p>
      )}
    </div>
  );
};

export default EmptyState;
