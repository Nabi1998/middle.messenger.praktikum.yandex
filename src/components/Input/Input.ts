// export default `<div class="input-wrapper">
//   <input id="{{id}}" name="{{name}}" type="{{type}}" placeholder="{{placeholder}}" value="{{value}}" class="input">
//   <div class="error-message" style="color:red; font-size:12px"></div>
// </div>`;

export default `<div class="input-wrapper">
  <input
    id="{{id}}"
    name="{{name}}"
    type="{{type}}"
    placeholder="{{placeholder}}"
    value="{{value}}"
    class="input"
    autocomplete="{{autocomplete}}"
  >
  <div class="error-message" style="color:red; font-size:12px"></div>
</div>`;
