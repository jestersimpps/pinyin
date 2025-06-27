// This component forces Tailwind to include DaisyUI theme classes in production build
// It's hidden but ensures all classes are available
export function ThemeForceInclude() {
  return (
    <div className="hidden">
      {/* Force include dropdown classes */}
      <div className="dropdown dropdown-content dropdown-end dropdown-open menu" />
      
      {/* Force include base colors for both themes */}
      <div data-theme="light">
        <div className="bg-base-100 bg-base-200 bg-base-300 text-base-content" />
      </div>
      <div data-theme="dark">
        <div className="bg-base-100 bg-base-200 bg-base-300 text-base-content" />
      </div>
      
      {/* Force include primary colors */}
      <div className="bg-primary text-primary-content btn-primary checkbox-primary" />
      
      {/* Force include component classes */}
      <div className="btn btn-ghost btn-circle btn-sm btn-lg" />
      <div className="card card-body shadow-xl" />
      <div className="navbar" />
      <div className="tabs tabs-boxed tab tab-active" />
      <div className="form-control label label-text" />
      <div className="input input-bordered input-primary" />
      <div className="select select-bordered select-primary" />
      <div className="checkbox checkbox-primary" />
      <div className="divider" />
      <div className="badge badge-primary badge-outline" />
      <div className="stat" />
      <div className="alert alert-error" />
      <div className="modal modal-open modal-box" />
      
      {/* Force include specific classes used in dropdowns */}
      <div className="z-[1] p-2 shadow rounded-box w-52" />
      
      {/* Force include transition classes */}
      <div className="transition-colors hover:bg-base-300" />
    </div>
  );
}