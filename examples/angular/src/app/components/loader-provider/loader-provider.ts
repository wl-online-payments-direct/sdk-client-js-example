/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */
import { Component } from '@angular/core';
import { LoaderService } from '../../services/loader-service';

@Component({
  selector: 'loader-provider',
  standalone: true,
  templateUrl: './loader-provider.html',
})
export class LoaderProvider {
  constructor(public loader: LoaderService) {}
}
