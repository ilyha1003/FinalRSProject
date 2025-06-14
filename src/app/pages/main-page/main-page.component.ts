import { Component, OnInit } from '@angular/core';
import { Category } from '../../utils/interfaces/interface-categories';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-main-page',
  imports: [NgIf],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
})
export class MainPageComponent implements OnInit {
  public categories: Category[] = [];
  public copied = false;

  constructor(private router: Router) {}

  public copyCode(code: string): void {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        this.copied = true;
        setTimeout(() => (this.copied = false), 2000);
      })
      .catch((error) => {
        console.error('Could not copy text:', error);
      });
  }

  public goToCategory(slug: string): void {
    this.router.navigate(['/catalog/category', slug]);
  }

  public async getCategories(): Promise<void> {
    try {
      const responseCategories = await ApiService.getCategories();
      if (responseCategories) {
        for (const category of responseCategories) {
          if (category.id !== '40ef5f03-e5f7-4234-9a4a-71e5efa0b604') {
            this.categories.push(category);
          }
        }
      }
    } catch (error) {
      console.error('getCategorie error:', error);
    }
  }

  public async ngOnInit(): Promise<void> {
    await this.getCategories();
  }
}
