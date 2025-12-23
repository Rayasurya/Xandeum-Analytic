export interface IBlockOptions {
  renderProperties?: (ele: HTMLDivElement) => void;
}

export function createBlock(className: string, options?: IBlockOptions): HTMLElement {
  const ele = document.createElement("DIV");
  ele.classList.add("block");
  ele.classList.add(className);

  ele.addEventListener("click", () => {
    const eleProperties = document.querySelector("#editor-designer-properties");

    if (ele.classList.contains("selected")) {
      ele.classList.remove("selected");

      if (eleProperties) {
        eleProperties.innerHTML = `<div style="text-align:center"><em>(Select a block)</em></div>`;
      }
    } else {
      document.querySelectorAll("#editor-designer .block").forEach(ele => {
        ele.classList.remove("selected");
      });

      ele.classList.add("selected");

      if (eleProperties) {
        eleProperties.innerHTML = "";
      }

      if (options) {
        if (options.renderProperties && eleProperties) {
          options.renderProperties(eleProperties as HTMLDivElement);
        }
      }

      if (eleProperties?.innerHTML.length === 0) {
        eleProperties.innerHTML = `<div style="text-align:center"><em>(No property available)</em></div>`;
      }
    }
  });

  return ele;
}

export function createFieldText(ele: HTMLDivElement, v: string, onChange: (v: string) => void, label?: string) {
  if (label) {
    const eleLabel = document.createElement("LABEL") as HTMLLabelElement;
    eleLabel.innerHTML = label;
    ele.appendChild(eleLabel);
  }

  const eleInput = document.createElement("INPUT") as HTMLInputElement;
  eleInput.value = v;
  eleInput.addEventListener("change", () => onChange(eleInput.value));
  ele.appendChild(eleInput);
}

export function createSettings(
  properties: {[k:string]: string | number | boolean} = {},
  onPropertyClick: (k: string) => void = () => void 0,
  className: string | null = null,
): HTMLElement {
  const ele = document.createElement("DIV");
  ele.classList.add("block__settings");

  if (className) {
    ele.classList.add(className);
  }

  for (let k in properties) {
    const item = document.createElement("DIV");
    let v = "";

    if (typeof properties[k] === "string" || typeof properties[k] === "number") {
      v = properties[k].toString();
    } else if (typeof properties[k] === "boolean") {
      v = properties[k] ? "TRUE" : "FALSE";
    }

    item.classList.add("block__settings-item");
    item.innerHTML = `<code><strong>${k}</strong>: ${v}</code>`;

    if (onPropertyClick) {
      item.addEventListener("click", () => onPropertyClick(k));
    }

    ele.append(item);
  }

  return ele;
}

export function withName(name: string | null | undefined, content: string): string {
  if (!name) {
    return content;
  }

  return `<div class="block__name">Name: ${name}</div>${content}`;
}
