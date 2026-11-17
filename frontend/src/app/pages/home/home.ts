import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Candidato } from '../../core/models/candidato';
import { CandidatoService } from '../../core/services/candidato.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private candidatoService = inject(CandidatoService);
  candidatos: Candidato[] = [];
  mensagem = '';
  erro = '';

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.candidatoService.listar().subscribe({
      next: dados => {
        this.candidatos = dados;
        this.erro = '';
      },
      error: () => this.erro = 'Nao foi possivel carregar os candidatos.'
    });
  }

  votar(id: number): void {
    this.candidatoService.votar(id).subscribe({
      next: () => {
        this.mensagem = 'Voto registrado!';
        this.carregar();
      },
      error: () => this.erro = 'Nao foi possivel registrar o voto.'
    });
  }

  excluir(id: number): void {
    if (!confirm('Deseja excluir este candidato?')) return;
    this.candidatoService.excluir(id).subscribe({
      next: () => {
        this.mensagem = 'Candidato excluido!';
        this.carregar();
      },
      error: () => this.erro = 'Nao foi possivel excluir o candidato.'
    });
  }
}