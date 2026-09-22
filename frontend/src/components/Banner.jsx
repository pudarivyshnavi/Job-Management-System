function Banner({ type = "info", children }) {
  if (!children) {
    return null;
  }
  return (
    <div className={`banner banner-${type}`} role={type === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}

export default Banner;
