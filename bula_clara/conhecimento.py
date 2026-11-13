"""Dicionários de apoio: nomes comerciais/populares e classes terapêuticas.

As classes servem para o Agente de Interações: as bulas costumam citar a CLASSE
("anti-inflamatórios", "anticoagulantes") e não o nome de cada remédio.
⚠️ Revisar/expandir com a equipe conforme novos medicamentos entrarem na base.
"""

# nome comercial / popular  ->  nome na base (= nome do arquivo da bula)
APELIDOS = {
    "novalgina": "dipirona", "dipirona sodica": "dipirona", "metamizol": "dipirona",
    "tylenol": "paracetamol", "acetaminofeno": "paracetamol",
    "advil": "ibuprofeno", "alivium": "ibuprofeno",
    "aas": "acido acetilsalicilico", "aspirina": "acido acetilsalicilico",
    "cozaar": "losartana", "losartana potassica": "losartana",
    "renitec": "enalapril", "maleato de enalapril": "enalapril",
    "capoten": "captopril",
    "glifage": "metformina", "cloridrato de metformina": "metformina",
    "zocor": "sinvastatina",
    "losec": "omeprazol",
    "amoxil": "amoxicilina",
    "marevan": "varfarina", "coumadin": "varfarina", "varfarina sodica": "varfarina",
    "plavix": "clopidogrel",
    "puran t4": "levotiroxina", "euthyrox": "levotiroxina", "synthroid": "levotiroxina",
    "clorana": "hidroclorotiazida",
}

# medicamento -> termos que uma OUTRA bula pode usar para se referir a ele
CLASSES = {
    "dipirona": ["dipirona", "metamizol", "analgésico", "pirazolon"],
    "paracetamol": ["paracetamol", "acetaminofeno"],
    "ibuprofeno": ["ibuprofeno", "anti-inflamató", "antiinflamató", "aine"],
    "acido acetilsalicilico": ["ácido acetilsalicílico", "acido acetilsalicilico", "aas", "salicilato",
                               "anti-inflamató", "antiagregante", "antiplaquetá"],
    "losartana": ["losartana", "anti-hipertensiv", "antagonista", "bloqueador do receptor da angiotensina"],
    "enalapril": ["enalapril", "anti-hipertensiv", "inibidores da eca", "inibidor da eca",
                  "inibidores da enzima conversora"],
    "captopril": ["captopril", "anti-hipertensiv", "inibidores da eca", "inibidor da eca",
                  "inibidores da enzima conversora"],
    "hidroclorotiazida": ["hidroclorotiazida", "diurético", "tiazídico", "anti-hipertensiv"],
    "metformina": ["metformina", "antidiabétic", "hipoglicemiante"],
    "sinvastatina": ["sinvastatina", "estatina", "inibidores da hmg-coa"],
    "omeprazol": ["omeprazol", "inibidores da bomba de prótons", "inibidor da bomba de prótons"],
    "amoxicilina": ["amoxicilina", "antibiótico", "penicilina"],
    "varfarina": ["varfarina", "anticoagulante", "cumarínico"],
    "clopidogrel": ["clopidogrel", "antiagregante", "antiplaquetá"],
    "levotiroxina": ["levotiroxina", "hormônio tireoidiano", "hormônios tireoidianos"],
}

# termos de classe genéricos demais: só contam como interação se aparecerem perto de palavras de risco
TERMOS_FRACOS = {"analgésico", "antagonista", "anti-hipertensiv", "antibiótico", "aine", "aas"}
