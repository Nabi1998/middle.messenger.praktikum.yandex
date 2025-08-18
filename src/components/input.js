// export default `<input id="{{id}}" name="{{name}}" type="{{type}}" placeholder="{{placeholder}}" value="{{value}}" class="input">`;

import { validateField } from "../utils/validation";

export default `<div class="input-wrapper">
  <input id="{{id}}" name="{{name}}" type="{{type}}" placeholder="{{placeholder}}" value="{{value}}" class="input">
  <div class="error-message" style="color:red; font-size:12px"></div>
</div>`;
