const Canvas = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 min-h-[600px] transition-colors duration-300">
      <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg h-full flex items-center justify-center">
        <p className="text-slate-400 dark:text-slate-500">Score preview will appear here</p>
      </div>
    </div>
  );
}

export default Canvas;