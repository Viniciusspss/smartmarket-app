import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-aside-items',
  imports: [NgClass],
  templateUrl: './aside-items.html',
})
export class AsideItems {
  public text = input.required<string>();
  public image = input<string | null>(null);
  public disabled = input<boolean>(false);
  public selected = input<boolean>(false);
}
