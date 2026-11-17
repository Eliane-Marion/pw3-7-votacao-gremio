import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Candidato } from '../../core/models/candidato';
import { CandidatoService } from '../../core/services/candidato.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private candidatoService = inject(CandidatoService);
  private fb = inject(FormBuilder);
  candidatos: Candidato[] = [];
  editandoId: number | null = null;
  mensagem = '';
  erro = '';
  enviando = false;

  formulario = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    categoria: ['', [Validators.required, Validators.minLength(2)]]
  });

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.candidatoService.listar().subscribe({
      next: dados => {
        this.candidatos = dados;
        this.erro = '';
      },
      error: () => this.erro = 'Nao foi possivel carregar os candidatos. Verifique o backend.'
    });
  }

  votar(id: number): void {
    this.mensagem = '';
    this.candidatoService.votar(id).subscribe({
      next: () => {
        this.mensagem = 'Voto registrado!';
        this.carregar();
      },
      error: err => this.erro = err.error?.message || 'Nao foi possivel registrar o voto.'
    });
  }

  excluir(id: number): void {
    if (!confirm('Deseja excluir este candidato?')) return;
    this.mensagem = '';
    this.candidatoService.excluir(id).subscribe({
      next: () => {
        this.mensagem = 'Candidato excluido!';
        if (this.editandoId === id) this.cancelar();
        this.carregar();
      },
      error: err => this.erro = err.error?.message || 'Nao foi possivel excluir o candidato.'
    });
  }

  editar(candidato: Candidato): void {
    this.editandoId = candidato.id;
    this.mensagem = '';
    this.erro = '';
    this.formulario.setValue({ nome: candidato.nome, categoria: candidato.categoria });
  }

  cancelar(): void {
    this.editandoId = null;
    this.formulario.reset();
  }

  salvar(): void {
    if (this.formulario.invalid || this.enviando) {
      this.formulario.markAllAsTouched();
      return;
    }
    const dados = this.formulario.getRawValue();
    const operacao = this.editandoId === null
      ? this.candidatoService.criar(dados)
      : this.candidatoService.editar(this.editandoId, dados);
    this.enviando = true;
    this.erro = '';
    this.mensagem = '';
    operacao.subscribe({
      next: () => {
        this.mensagem = this.editandoId === null ? 'Candidato cadastrado!' : 'Candidato atualizado!';
        this.cancelar();
        this.enviando = false;
        this.carregar();
      },
      error: err => {
        this.enviando = false;
        this.erro = err.error?.message || 'Nao foi possivel salvar o candidato.';
      }
    });
  }
}