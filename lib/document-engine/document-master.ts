export interface DocumentDefinition {
  id: string
  tier: 1 | 2 | 3
  category: string
  document_name: string
  obtain_from: string
  estimated_cost: string
  estimated_days: string
  notes: string
  why_needed: string
}

// ─────────────────────────────────────────────────────────
// TIER 1: 全案件共通（条件なし）
// ─────────────────────────────────────────────────────────
export const TIER1_DOCUMENTS: DocumentDefinition[] = [
  {
    id: 'dec_koseki',
    tier: 1,
    category: 'basic',
    document_name: '被相続人の戸籍謄本（出生から死亡まで全期間連続）',
    obtain_from: '本籍地の市区町村窓口（令和6年3月〜広域交付制度で1か所での取得可能）',
    estimated_cost: '450〜750円/通（複数通必要な場合あり）',
    estimated_days: '即日〜2週間（転籍歴がある場合は複数役場への郵送請求が必要）',
    notes:
      '出生から死亡まで途切れなく連続して取得する必要があります。転籍歴がある場合は複数の役場への請求が必要。法定相続情報一覧図を利用すると各機関での手続きが簡略化できます。',
    why_needed:
      '相続人が誰であるかを法的に証明するための最重要書類です。すべての親族関係をもとに法定相続人を確定します。これがないと他の手続きが一切進みません。',
  },
  {
    id: 'dec_juminpyo',
    tier: 1,
    category: 'basic',
    document_name: '被相続人の住民票除票',
    obtain_from: '死亡時の住所地市区町村窓口',
    estimated_cost: '200〜400円',
    estimated_days: '即日',
    notes: '「除票」を請求してください。通常の住民票ではありません。',
    why_needed:
      '被相続人の最終住所を公的に証明します。相続税申告書の提出先（税務署）の確定にも使用します。',
  },
  {
    id: 'heir_koseki',
    tier: 1,
    category: 'basic',
    document_name: '相続人全員の戸籍謄本',
    obtain_from: '各相続人の本籍地市区町村窓口',
    estimated_cost: '450円/通',
    estimated_days: '数日（郵送の場合は1〜2週間）',
    notes: '相続人の人数分必要。',
    why_needed: '相続人であることと被相続人との続柄を証明します。',
  },
  {
    id: 'heir_juminpyo',
    tier: 1,
    category: 'basic',
    document_name: '相続人全員の住民票',
    obtain_from: '各相続人の住所地市区町村窓口',
    estimated_cost: '200〜400円/通',
    estimated_days: '即日',
    notes: '相続人の人数分必要。',
    why_needed: '相続人の現住所の確認に使用します。',
  },
  {
    id: 'heir_inkan',
    tier: 1,
    category: 'basic',
    document_name: '相続人全員の印鑑証明書（原本）',
    obtain_from: '各相続人の住所地市区町村窓口',
    estimated_cost: '200〜300円/通',
    estimated_days: '即日',
    notes: 'コピー不可。原本が必須です。特例適用時は複数通必要な場合があります。有効期限（3ヶ月）に注意。',
    why_needed: '遺産分割協議書・各金融機関等の相続手続きに必須の実印の証明書です。',
  },
  {
    id: 'heir_mynumber',
    tier: 1,
    category: 'basic',
    document_name: '相続人全員のマイナンバー確認書類（コピー）',
    obtain_from: '自宅',
    estimated_cost: '無料',
    estimated_days: '即時',
    notes:
      'マイナンバーカード（表裏）またはマイナンバー通知カード＋本人確認書類。相続税申告書への記載のために収集。実数字はシステム外で厳重に管理してください。',
    why_needed: '相続税申告書には相続人全員のマイナンバー記載が義務付けられています（番号法）。',
  },
  {
    id: 'legal_heirs_list',
    tier: 1,
    category: 'basic',
    document_name: '法定相続情報一覧図の写し（任意・戸籍謄本の束の代替）',
    obtain_from: '法務局（相続登記と同時申請が効率的）',
    estimated_cost: '無料（何通でも取得可）',
    estimated_days: '1〜2週間',
    notes:
      '戸籍謄本一式を法務局に持参して申請。発行後は各金融機関・役場での手続きで戸籍謄本の束を代替できます。複数機関に手続きが必要な場合に特に有用。',
    why_needed: '法務局が認証した相続関係の概要図。金融機関・不動産登記等の手続きが大幅に簡略化されます。',
  },
]

// ─────────────────────────────────────────────────────────
// TIER 2: 財産種類別
// ─────────────────────────────────────────────────────────
export const TIER2_DOCUMENTS: Record<string, DocumentDefinition[]> = {
  real_estate: [
    {
      id: 're_kotei',
      tier: 2,
      category: 'real_estate',
      document_name: '固定資産税課税明細書（相続開始年度）',
      obtain_from: '不動産所在地の各市区町村役場',
      estimated_cost: '300円程度/通',
      estimated_days: '即日',
      notes:
        '相続開始年度（ご逝去の年）のものが必要。固定資産評価証明書と混同しないこと。毎年4月頃に送付される書類を保管している場合は不要。',
      why_needed: '不動産の固定資産税評価額を確認するための書類。相続税評価の基礎となります。',
    },
    {
      id: 're_nayose',
      tier: 2,
      category: 'real_estate',
      document_name: '名寄帳（なよせちょう）',
      obtain_from: '不動産所在地の各市区町村役場（所在地ごとに別々に請求）',
      estimated_cost: '無料〜300円',
      estimated_days: '即日',
      notes:
        '被相続人の氏名で請求。複数の市区町村に不動産がある場合は各自治体に別途請求。令和8年2月以降は全国統一システムで一括確認可能になる予定。',
      why_needed:
        '被相続人が所有するすべての不動産を漏れなく把握するための書類。見落とし防止に不可欠。税務調査でも重点確認項目。',
    },
    {
      id: 're_touki',
      tier: 2,
      category: 'real_estate',
      document_name: '登記事項証明書（登記簿謄本）',
      obtain_from: '法務局（全国どこでも・オンライン申請可）',
      estimated_cost: '600円/通',
      estimated_days: '即日（窓口）〜3日（オンライン申請は翌日郵送）',
      notes:
        '不動産1件ごとに取得。土地・建物は別々に申請。⚠️令和6年4月から相続登記が義務化（相続を知った日から3年以内）。',
      why_needed: '所有者・抵当権・地目・面積などを法的に確認。評価と相続登記（義務化）に使用。',
    },
    {
      id: 're_kozu',
      tier: 2,
      category: 'real_estate',
      document_name: '公図・地積測量図',
      obtain_from: '法務局',
      estimated_cost: '450円/通',
      estimated_days: '即日',
      notes: '農地・山林では特に重要。測量図がない場合もあります。',
      why_needed: '土地の形状・面積・隣地との境界を確認。路線価評価（奥行補正等）の計算に必要。',
    },
  ],

  deposits: [
    {
      id: 'dep_zandaka',
      tier: 2,
      category: 'deposits',
      document_name: '残高証明書（ご逝去日時点）',
      obtain_from: '各金融機関（銀行・信用金庫・ゆうちょ銀行等）',
      estimated_cost: '1,000〜2,000円/通',
      estimated_days: '1〜2週間（早めに依頼を！）',
      notes:
        '「相続に伴う残高証明書」として請求。ご逝去日時点のものが必要。普通・定期・外貨すべての口座分必要。⚠️ネット銀行・PayPay銀行等のデジタル口座も忘れずに。',
      why_needed:
        '相続税の課税対象となる預貯金額を証明します。ご逝去日現在の残高が評価額となります。',
    },
    {
      id: 'dep_tsucho',
      tier: 2,
      category: 'deposits',
      document_name: '過去5〜7年分の通帳・取引明細',
      obtain_from: '各金融機関（過去分は通帳再発行または取引明細請求）',
      estimated_cost: '無料〜1,100円/年分',
      estimated_days: '即日〜1週間',
      notes:
        '名義預金（実質的に被相続人の財産）の調査のため税務調査で必ず確認されます。解約済口座も要確認。⚠️令和6年以降の相続は生前贈与の持ち戻しが7年に延長。',
      why_needed:
        '税務調査での名義預金の指摘を防ぐため、資金の流れを確認します。生前贈与の立証にも使用。相続税の申告漏れで最も多い指摘事項のひとつです。',
    },
    {
      id: 'dep_ri息',
      tier: 2,
      category: 'deposits',
      document_name: '既経過利息計算書（定期預金のみ）',
      obtain_from: '各金融機関',
      estimated_cost: '無料〜数百円',
      estimated_days: '残高証明書と同時に取得可',
      notes: '定期預金がある場合のみ必要。',
      why_needed: 'ご逝去日時点の経過利息も相続財産となります。定期預金の評価額の一部です。',
    },
  ],

  listed_stocks: [
    {
      id: 'ls_zandaka',
      tier: 2,
      category: 'listed_stocks',
      document_name: '証券口座の残高証明書（ご逝去日時点）',
      obtain_from: '各証券会社',
      estimated_cost: '1,000〜3,300円/通',
      estimated_days: '1〜2週間',
      notes:
        '複数の証券会社に口座がある場合はすべて取得。単元未満株は株主名簿管理人（信託銀行）へ別途照会。全口座を一括確認したい場合は証券保管振替機構へ照会（6,050円・2週間）。',
      why_needed:
        '相続財産としての上場株式の評価（ご逝去日を含む月の株価平均等）に使用します。',
    },
    {
      id: 'ls_haito',
      tier: 2,
      category: 'listed_stocks',
      document_name: '配当金支払通知書（直近分）',
      obtain_from: '自宅（郵送で届いた書類）または証券会社から取引明細請求',
      estimated_cost: '無料',
      estimated_days: '即日（手元にある場合）',
      notes: '配当金の未収分も相続財産に含まれます。',
      why_needed:
        'ご逝去日現在の未収配当金を相続財産として計上するために必要です。',
    },
  ],

  unlisted_stocks: [
    {
      id: 'ul_kessan',
      tier: 2,
      category: 'unlisted_stocks',
      document_name: '直近3期分の決算書（貸借対照表・損益計算書）',
      obtain_from: '会社（経理部門）から取得',
      estimated_cost: '無料',
      estimated_days: '1〜3週間（会社への依頼が必要）',
      notes:
        '会社規模によって類似業種比準価額方式・純資産価額方式・折衷方式のいずれかで評価。子会社がある場合は子会社の決算書も必要。',
      why_needed:
        '非上場株式の相続税評価額を算定するための基礎データ。最も評価計算が複雑な財産のひとつ。',
    },
    {
      id: 'ul_houjin',
      tier: 2,
      category: 'unlisted_stocks',
      document_name: '直近3期分の法人税申告書',
      obtain_from: '会社（経理部門）から取得',
      estimated_cost: '無料',
      estimated_days: '1〜3週間',
      notes: '',
      why_needed: '株式評価の計算に使用。配当・利益・純資産の確認に必要。',
    },
    {
      id: 'ul_kabunushi',
      tier: 2,
      category: 'unlisted_stocks',
      document_name: '株主名簿（役職・続柄記載）',
      obtain_from: '会社',
      estimated_cost: '無料',
      estimated_days: '1〜2週間',
      notes: '',
      why_needed: '株主構成・持株割合の確認に使用。',
    },
    {
      id: 'ul_teikan',
      tier: 2,
      category: 'unlisted_stocks',
      document_name: '会社の定款・登記事項証明書',
      obtain_from: '会社・法務局',
      estimated_cost: '無料・600円',
      estimated_days: '即日〜1週間',
      notes: '',
      why_needed: '会社の基本情報・資本金・役員構成の確認に使用。',
    },
  ],

  life_insurance: [
    {
      id: 'li_shiharai',
      tier: 2,
      category: 'life_insurance',
      document_name: '保険金支払通知書（支払調書）',
      obtain_from: '各生命保険会社（請求後に送付）',
      estimated_cost: '無料',
      estimated_days: '5〜45日（保険会社による）',
      notes:
        '⚠️全加入保険を一括確認したい場合は生命保険協会へ照会（3,000円・約2週間）。保険料負担者が被相続人かどうかで課税方法が変わります。',
      why_needed:
        '生命保険金は「みなし相続財産」として課税対象。非課税枠（500万円×法定相続人数）を超えた分が課税されます。',
    },
    {
      id: 'li_hoken_sho',
      tier: 2,
      category: 'life_insurance',
      document_name: '保険証書（全契約分）のコピー',
      obtain_from: '自宅',
      estimated_cost: '無料',
      estimated_days: '即時',
      notes: '解約返戻金がある契約（被相続人以外が保険料負担）も評価対象。',
      why_needed: '契約内容・受取人・保険料負担者を確認するため。',
    },
    {
      id: 'li_futansha',
      tier: 2,
      category: 'life_insurance',
      document_name: '保険料負担者確認資料（通帳・保険料領収書等）',
      obtain_from: '自宅・各保険会社',
      estimated_cost: '無料',
      estimated_days: '即時〜1週間',
      notes: '誰が保険料を払っていたかで課税関係（相続税・所得税・贈与税）が異なります。',
      why_needed: '保険料の負担者によって課税方法が変わるため、確認が必須です。',
    },
  ],

  retirement_allowance: [
    {
      id: 'ra_taishoku',
      tier: 2,
      category: 'retirement_allowance',
      document_name: '死亡退職金支払通知書（源泉徴収票）',
      obtain_from: '勤務先会社',
      estimated_cost: '無料',
      estimated_days: '1〜2週間',
      notes:
        '死亡後3年以内に支給が確定した退職金が対象。非課税枠は生命保険と同じく500万円×法定相続人数。',
      why_needed:
        '死亡退職金は「みなし相続財産」として相続税の課税対象。非課税枠を超えた分が課税されます。',
    },
  ],

  farmland: [
    {
      id: 'fa_nougyou',
      tier: 2,
      category: 'farmland',
      document_name: '農業委員会の証明書（耕作証明書）',
      obtain_from: '農地所在地の農業委員会',
      estimated_cost: '数百円',
      estimated_days: '1〜2週間',
      notes: '農地の評価（農業投資価格等）の算定に必要。',
      why_needed: '農地として評価するための公的な証明書。一般の宅地とは異なる評価方法が適用されます。',
    },
    {
      id: 'fa_kotei',
      tier: 2,
      category: 'farmland',
      document_name: '固定資産評価証明書（農地分）',
      obtain_from: '農地所在地の市区町村役場',
      estimated_cost: '300円程度',
      estimated_days: '即日',
      notes: '',
      why_needed: '農地の固定資産税評価額の確認に使用。',
    },
  ],

  overseas_assets: [
    {
      id: 'oa_gaikoku',
      tier: 2,
      category: 'overseas_assets',
      document_name: '海外資産の残高証明書・評価書類',
      obtain_from: '海外金融機関・不動産会社等',
      estimated_cost: '数千円〜（海外送金・翻訳費含む）',
      estimated_days: '2〜4週間',
      notes: '外国語書類は日本語翻訳が必要。外貨建て資産はご逝去日の為替レートで評価。',
      why_needed: '日本居住の被相続人の海外資産も全て相続税の課税対象です。',
    },
    {
      id: 'oa_zairyu',
      tier: 2,
      category: 'overseas_assets',
      document_name: '在留証明書・サイン証明書（海外在住の相続人がいる場合）',
      obtain_from: '在外日本大使館・領事館',
      estimated_cost: '数百円〜',
      estimated_days: '1〜2週間',
      notes: '海外在住の相続人は印鑑証明書の代わりにサイン証明書を使用。',
      why_needed: '海外在住の相続人の遺産分割協議への参加を証明するために必要。',
    },
  ],

  crypto: [
    {
      id: 'cr_crypto',
      tier: 2,
      category: 'crypto',
      document_name: '暗号資産の残高・評価証明書',
      obtain_from: '各取引所（bitFlyer・Coincheck等）',
      estimated_cost: '無料〜数百円',
      estimated_days: '即日〜1週間',
      notes:
        '⚠️取引所管理外のウォレット（ハードウェアウォレット等）は特に注意。パスワード不明の場合は資産が失われる可能性あり。複数取引所に口座がある場合はすべて確認。',
      why_needed: '暗号資産もご逝去日時点の時価で相続税の課税対象となります。',
    },
  ],

  debt: [
    {
      id: 'dt_kariire',
      tier: 2,
      category: 'debt',
      document_name: '借入金残高証明書・返済予定表',
      obtain_from: '各金融機関（住宅ローン等）',
      estimated_cost: '無料〜数百円',
      estimated_days: '1〜2週間',
      notes: '住宅ローン・事業ローン・カードローン等すべての借入れが対象。',
      why_needed: '債務は相続財産から控除できます（相続税法13条）。遺産の純額の計算に必要。',
    },
    {
      id: 'dt_iryo',
      tier: 2,
      category: 'debt',
      document_name: '未払医療費の領収書・請求書',
      obtain_from: '病院・薬局',
      estimated_cost: '無料',
      estimated_days: '即時',
      notes: 'ご逝去日時点で未払の医療費が控除対象。',
      why_needed: 'ご逝去日時点の未払医療費は債務控除の対象です。',
    },
    {
      id: 'dt_soushiki',
      tier: 2,
      category: 'debt',
      document_name: '葬儀会社の領収書・明細書（火葬場・霊柩車含む）',
      obtain_from: '葬儀会社',
      estimated_cost: '無料',
      estimated_days: '即時',
      notes: '⚠️香典返し・仏壇・位牌の購入費は葬式費用に含まれません（控除不可）。',
      why_needed: '葬式費用は相続財産から控除できます（相続税法13条）。領収書は必ず保管を。',
    },
    {
      id: 'dt_ofuse',
      tier: 2,
      category: 'debt',
      document_name: 'お布施・心付けのメモ（支払日・相手先・金額）',
      obtain_from: '自作（支払時に記録）',
      estimated_cost: '無料',
      estimated_days: '即時',
      notes: 'お布施は領収書が出ないことが多いため、メモで代替可。金額・支払先・日付を記録。',
      why_needed: 'お布施も葬式費用として控除できます。合理的な金額であれば認められます。',
    },
  ],
}

// ─────────────────────────────────────────────────────────
// TIER 3: 特例・遺言書・特殊事情別
// ─────────────────────────────────────────────────────────
export const TIER3_DOCUMENTS: Record<string, DocumentDefinition[]> = {
  will_none: [
    {
      id: 'w_kyogi',
      tier: 3,
      category: 'will',
      document_name: '遺産分割協議書',
      obtain_from: '税理士・司法書士が作成（または相続人で自作）',
      estimated_cost: '数万円（専門家依頼の場合）',
      estimated_days: '数週間〜数ヶ月（相続人全員の合意次第）',
      notes:
        '相続人全員の実印の押印が必要。一人でも反対すると成立しない。⚠️配偶者の税額軽減・小規模宅地の特例は申告期限までの分割成立が原則要件。',
      why_needed:
        '遺言書がない場合、遺産の分け方を相続人全員で合意した証明書。税務申告・不動産登記・金融機関手続きに必須。',
    },
  ],

  will_holographic_self: [
    {
      id: 'w_jihitsu_gen',
      tier: 3,
      category: 'will',
      document_name: '自筆証書遺言（原本）',
      obtain_from: '遺品の中から発見',
      estimated_cost: '無料',
      estimated_days: '即時',
      notes: '⚠️開封厳禁！未開封のまま家庭裁判所へ持参。勝手に開封すると5万円以下の過料。',
      why_needed: '遺産分割の法的根拠となります。',
    },
    {
      id: 'w_kenin',
      tier: 3,
      category: 'will',
      document_name: '家庭裁判所の検認済証明書',
      obtain_from: '家庭裁判所（被相続人の最終住所地管轄）',
      estimated_cost: '150円（申立費用別途）',
      estimated_days: '1〜2ヶ月（申立から）',
      notes: '⚠️検認は申告書作成前に完了させること。1〜2ヶ月かかるため早急に申立てが必要。',
      why_needed: '自筆証書遺言を使用するために法律上必須の手続き。検認なしでの利用は違法。',
    },
  ],

  will_holographic_registry: [
    {
      id: 'w_hokan_cert',
      tier: 3,
      category: 'will',
      document_name: '遺言書情報証明書',
      obtain_from: '法務局（遺言書保管所）',
      estimated_cost: '1,400円',
      estimated_days: '3〜5日',
      notes: '法務局保管の自筆証書遺言は検認手続き不要。',
      why_needed: '法務局に保管された遺言書の内容を証明する書類。金融機関手続き等に使用。',
    },
  ],

  renunciation: [
    {
      id: 'ren_cert',
      tier: 3,
      category: 'renunciation',
      document_name: '相続放棄申述受理証明書',
      obtain_from: '家庭裁判所（被相続人の最終住所地管轄）',
      estimated_cost: '150円/通',
      estimated_days: '申述受理後即日発行',
      notes:
        '申述受理通知書（1枚しかない）と別物。何通でも取得可能な「証明書」を請求すること。相続放棄者がいても法定相続人の数は変わりません（基礎控除の計算には含める）。',
      why_needed:
        '相続放棄者が相続に参加しないことを証明。遺産分割協議書への署名が不要になります。',
    },
  ],

  small_land_cohabitant: [
    {
      id: 'sl_co_juminpyo',
      tier: 3,
      category: 'small_land',
      document_name: '相続人の住民票（同居を証明するもの）',
      obtain_from: '市区町村役場',
      estimated_cost: '200〜400円',
      estimated_days: '即日',
      notes: '被相続人と同じ住所に住民票が登録されていることを確認。',
      why_needed: '同居親族として特定居住用宅地等の特例（最大80%減額）を適用するための証明。',
    },
    {
      id: 'sl_co_fuhyo',
      tier: 3,
      category: 'small_land',
      document_name: '戸籍の附票（住所変遷の確認）',
      obtain_from: '本籍地市区町村役場',
      estimated_cost: '300円',
      estimated_days: '即日〜数日',
      notes: '相続開始前から申告期限まで引き続き居住・所有していることの確認に使用。',
      why_needed: '同居継続の要件確認のため。',
    },
  ],

  small_land_homeless_child: [
    {
      id: 'sl_hc_chinshaku',
      tier: 3,
      category: 'small_land',
      document_name: '相続開始前3年間の賃貸契約書（全期間分）',
      obtain_from: '自宅・不動産管理会社',
      estimated_cost: '無料',
      estimated_days: '即時',
      notes:
        '持ち家なしを証明するため、3年間継続して賃貸住まいであったことを証明。途切れがあると特例不可。',
      why_needed:
        '「家なき子特例」の適用条件として、相続開始前3年以内に自己または配偶者所有の家屋に居住していなかったことの証明。最大80%減額。',
    },
    {
      id: 'sl_hc_juminpyo',
      tier: 3,
      category: 'small_land',
      document_name: '相続人の住民票（賃貸住所のもの）',
      obtain_from: '市区町村役場',
      estimated_cost: '200〜400円',
      estimated_days: '即日',
      notes: '',
      why_needed: '賃貸住まいであることの確認。',
    },
  ],

  small_land_nursing_home: [
    {
      id: 'sl_nh_kaigo',
      tier: 3,
      category: 'small_land',
      document_name: '介護保険被保険者証（写し）',
      obtain_from: '自宅',
      estimated_cost: '無料',
      estimated_days: '即時',
      notes: '要介護または要支援認定を受けていたことを証明。',
      why_needed: '老人ホーム入居者への小規模宅地特例適用のため、介護が必要な状態であったことの証明。',
    },
    {
      id: 'sl_nh_keiyaku',
      tier: 3,
      category: 'small_land',
      document_name: '老人ホーム等の入居契約書',
      obtain_from: '施設',
      estimated_cost: '無料',
      estimated_days: '即時',
      notes: '都道府県知事の指定を受けた施設であることを確認してください。',
      why_needed: '法令上の要件を満たす施設への入居であることの証明。',
    },
  ],

  prior_gifts: [
    {
      id: 'pg_zoto_申告',
      tier: 3,
      category: 'prior_gifts',
      document_name: '過去7年分の贈与税申告書（控え）',
      obtain_from: '自宅保管分、または税務署に閲覧請求',
      estimated_cost: '無料（閲覧）',
      estimated_days: '即時〜1週間',
      notes:
        '⚠️令和6年1月1日以降の相続から持ち戻し期間が3年→7年に延長（段階適用）。令和13年以降は完全に7年適用。税務調査の最頻指摘事項のひとつ。',
      why_needed:
        '相続開始前7年以内の生前贈与は相続財産に加算されます（相続税法19条）。申告漏れは重加算税の対象になる場合があります。',
    },
  ],

  souzoku_kazeijoken: [
    {
      id: 'sk_todokede',
      tier: 3,
      category: 'souzoku_kazeijoken',
      document_name: '相続時精算課税選択届出書（過去の控え）',
      obtain_from: '自宅保管分',
      estimated_cost: '無料',
      estimated_days: '即時',
      notes:
        '平成15年以降に相続時精算課税を選択した分は全額が相続財産に加算。令和6年から年110万円の基礎控除が創設。',
      why_needed:
        '相続時精算課税で贈与を受けた財産は全て相続財産に加算して相続税を計算します。',
    },
    {
      id: 'sk_zoyo_申告',
      tier: 3,
      category: 'souzoku_kazeijoken',
      document_name: '相続時精算課税にかかる過去の贈与税申告書',
      obtain_from: '自宅保管分',
      estimated_cost: '無料',
      estimated_days: '即時',
      notes: '精算課税を選択した年以降の全申告書が必要。',
      why_needed: '精算課税の贈与財産を相続税に加算するための根拠書類。',
    },
  ],

  disabled_heir: [
    {
      id: 'dh_techo',
      tier: 3,
      category: 'disabled_heir',
      document_name: '障害者手帳（写し）または医師の診断書',
      obtain_from: '自宅（障害者手帳）または主治医（診断書）',
      estimated_cost: '診断書は5,000〜10,000円',
      estimated_days: '即時〜2週間',
      notes:
        '控除額：（85歳 − 相続時の年齢）× 10万円（一般）または20万円（特別障害者）。',
      why_needed: '障害者控除の適用根拠となります。税額を直接減額できる重要な控除。',
    },
  ],
}
