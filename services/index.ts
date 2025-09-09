export * from "./auth-service"
export * from "./clientes-service"
export * from "./fornecedores-service"
export * from "./funcionarios-service"
export * from "./apontamentos-service"
export * from "./materiais-service"
export * from "./obras-service"
export * from "./orcamentos-service"

// Exporta todos os serviços em um único objeto
import { authService } from "./auth-service"
import { clientesService } from "./clientes-service"
import { fornecedoresService } from "./fornecedores-service"
import { funcionariosService } from "./funcionarios-service"
import { apontamentosService } from "./apontamentos-service"
import { materiaisService } from "./materiais-service"
import { obrasService } from "./obras-service"
import { orcamentosService } from "./orcamentos-service"

export const api = {
  auth: authService,
  clientes: clientesService,
  fornecedores: fornecedoresService,
  funcionarios: funcionariosService,
  apontamentos: apontamentosService,
  materiais: materiaisService,
  obras: obrasService,
  orcamentos: orcamentosService,
}
