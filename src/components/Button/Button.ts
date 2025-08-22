const Button: string = `
<button id="{{id}}" type="submit" class="button"
  {{#if disabled}}
  disabled
  {{/if}}>{{text}}
</button>
`;

export default Button;
