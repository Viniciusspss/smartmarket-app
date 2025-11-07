import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBar } from '../../shared/components/side-bar/side-bar';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, SideBar],
  templateUrl: './dashboard-layout.html',
})
export class DashboardLayout {}
